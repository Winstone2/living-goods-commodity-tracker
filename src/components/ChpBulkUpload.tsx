import React, { useState, useCallback } from 'react';
import { Upload, FileText, Users, CheckCircle, AlertCircle, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ChpData {
  fullName: string;
  phoneNumber: string;
  isValid: boolean;
  errors: string[];
  registrationStatus?: 'pending' | 'success' | 'failed';
  errorMessage?: string;
}

interface ValidationResult {
  validCount: number;
  invalidCount: number;
  totalCount: number;
  data: ChpData[];
}

interface ApiRegistrationRequest {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}

const ChpBulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const { toast } = useToast();

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone number validation - adjust pattern as needed
    const phonePattern = /^[\+]?[1-9][\d]{3,14}$/;
    return phonePattern.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateChpData = (data: any[]): ValidationResult => {
    const processedData: ChpData[] = data.map((row, index) => {
      const fullName = row.fullName || row.FullName || row.FULLNAME || row.name || row.Name || row.NAME || '';
      const phoneNumber = row.phoneNumber || row.phone || row.Phone || row.PHONE || row.PhoneNumber || row.PHONENUMBER || '';
      
      const errors: string[] = [];
      
      if (!fullName.trim()) {
        errors.push('Full name is required');
      }
      
      if (!phoneNumber.trim()) {
        errors.push('Phone number is required');
      } else if (!validatePhoneNumber(phoneNumber)) {
        errors.push('Invalid phone number format');
      }
      
      return {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        isValid: errors.length === 0,
        errors
      };
    });

    const validCount = processedData.filter(item => item.isValid).length;
    const invalidCount = processedData.length - validCount;

    return {
      validCount,
      invalidCount,
      totalCount: processedData.length,
      data: processedData
    };
  };

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    if (!uploadedFile) return;

    const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension || '')) {
      toast({
        title: "Invalid file format",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          if (jsonData.length === 0) {
            toast({
              title: "Empty file",
              description: "The uploaded file contains no data",
              variant: "destructive"
            });
            setIsProcessing(false);
            return;
          }

          setUploadProgress(50);
          
          const result = validateChpData(jsonData);
          setValidationResult(result);
          setFile(uploadedFile);
          setUploadProgress(100);

          toast({
            title: "File processed successfully",
            description: `Found ${result.totalCount} records (${result.validCount} valid, ${result.invalidCount} invalid)`,
          });

        } catch (error) {
          toast({
            title: "Error processing file",
            description: "Failed to read the Excel file. Please check the format.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsArrayBuffer(uploadedFile);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the file",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  }, [toast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const registerSingleChp = async (chpData: ChpData): Promise<{ success: boolean; error?: string }> => {
    const registrationData: ApiRegistrationRequest = {
      username: chpData.fullName, // Use full name as username
      email: "admin@gmail.com", // Hard-coded email
      phoneNumber: chpData.phoneNumber,
      password: "admin@123", // Hard-coded password
      role: "CHP" // Hard-coded role
    };

    try {
      const response = await fetch('http://127.0.0.1:9000/api/auth/register', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  };

  const handleBulkRegistration = async () => {
    if (!validationResult || validationResult.validCount === 0) return;

    setIsProcessing(true);
    setUploadProgress(0);

    const validData = validationResult.data.filter(item => item.isValid);
    let successCount = 0;
    let failureCount = 0;

    // Update the validation result data to track individual registration status
    const updatedData = [...validationResult.data];
    
    try {
      for (let i = 0; i < validData.length; i++) {
        const chp = validData[i];
        const dataIndex = updatedData.findIndex(item => item.fullName === chp.fullName && item.phoneNumber === chp.phoneNumber);
        
        if (dataIndex !== -1) {
          updatedData[dataIndex].registrationStatus = 'pending';
          setValidationResult(prev => prev ? { ...prev, data: [...updatedData] } : null);
        }

        const result = await registerSingleChp(chp);
        
        if (dataIndex !== -1) {
          if (result.success) {
            updatedData[dataIndex].registrationStatus = 'success';
            successCount++;
          } else {
            updatedData[dataIndex].registrationStatus = 'failed';
            updatedData[dataIndex].errorMessage = result.error;
            failureCount++;
          }
          setValidationResult(prev => prev ? { ...prev, data: [...updatedData] } : null);
        }

        setUploadProgress(((i + 1) / validData.length) * 100);
      }

      if (successCount === validData.length) {
        setIsRegistrationComplete(true);
        toast({
          title: "Registration completed",
          description: `Successfully registered ${successCount} CHPs`,
        });
      } else {
        toast({
          title: "Registration partially completed",
          description: `${successCount} successful, ${failureCount} failed`,
          variant: failureCount > 0 ? "destructive" : "default"
        });
      }

    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred during registration.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setIsProcessing(false);
    setUploadProgress(0);
    setIsRegistrationComplete(false);
  };

  const downloadTemplate = () => {
    const template = [
      { fullName: 'John Doe', phoneNumber: '0701234567' },
      { fullName: 'Jane Smith', phoneNumber: '0709876543' },
      { fullName: 'Michael Johnson', phoneNumber: '0705555555' }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CHP Template');
    XLSX.writeFile(wb, 'chp-template.xlsx');
    
    toast({
      title: "Template downloaded",
      description: "Use this template to format your CHP data (fullName and phoneNumber columns required)",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-medical">
        <CardHeader className="bg-gradient-upload">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            CHP Bulk Registration
          </CardTitle>
          <CardDescription>
            Upload an Excel file to register multiple Community Health Practitioners at once
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {!file ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  isDragging 
                    ? 'border-primary bg-medical-light-blue' 
                    : 'border-muted-foreground/25 hover:border-primary hover:bg-medical-light-blue/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Upload Excel File</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop your Excel file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <Button asChild>
                  <label htmlFor="file-input" className="cursor-pointer">
                    Select File
                  </label>
                </Button>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Excel file should contain columns: <strong>fullName</strong> and <strong>phoneNumber</strong>
                  <br />
                  <span className="text-sm text-muted-foreground mt-1 block">
                    {/* Note: Email (admin@gmail.com), password (admin@123), and role (CHP) are auto-assigned. Username will be the full name. */}
                  </span>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </Button>
              </div>
              
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {validationResult && (
        <>
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Validation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Badge variant="outline" className="bg-success-light">
                  {validationResult.validCount} Valid
                </Badge>
                <Badge variant="outline" className="bg-error-light">
                  {validationResult.invalidCount} Invalid
                </Badge>
                <Badge variant="outline">
                  {validationResult.totalCount} Total
                </Badge>
              </div>
              
              {validationResult.invalidCount > 0 && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationResult.invalidCount} records have validation errors. Please review the table below.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="max-h-64 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Validation</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResult.data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.fullName}</TableCell>
                        <TableCell>{item.phoneNumber}</TableCell>
                        <TableCell>
                          <Badge variant={item.isValid ? "outline" : "destructive"}>
                            {item.isValid ? "Valid" : "Invalid"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.registrationStatus === 'pending' && (
                            <Badge variant="outline" className="bg-warning/10">
                              Registering...
                            </Badge>
                          )}
                          {item.registrationStatus === 'success' && (
                            <Badge variant="outline" className="bg-success/10 text-success">
                              Registered
                            </Badge>
                          )}
                          {item.registrationStatus === 'failed' && (
                            <Badge variant="destructive">
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.errors.length > 0 ? item.errors.join(", ") : ""}
                          {item.errorMessage && (
                            <span className="text-error block mt-1">
                              {item.errorMessage}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {!isRegistrationComplete && (
            <Card className="shadow-medical">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Ready to Register</h3>
                    <p className="text-sm text-muted-foreground">
                      {validationResult.validCount} valid CHPs will be registered
                    </p>
                  </div>
                  <Button
                    onClick={handleBulkRegistration}
                    disabled={isProcessing || validationResult.validCount === 0}
                    className="bg-gradient-success shadow-success"
                  >
                    {isProcessing ? "Registering..." : "Register CHPs"}
                  </Button>
                </div>
                
                {isProcessing && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Registering CHPs...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isRegistrationComplete && (
            <Card className="shadow-success border-success">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-success" />
                  <div>
                    <h3 className="font-semibold text-success">Registration Complete!</h3>
                    <p className="text-sm text-muted-foreground">
                      Successfully registered {validationResult.validCount} CHPs
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button onClick={handleReset} variant="outline">
                    Register More CHPs
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ChpBulkUpload;