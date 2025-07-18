import React, { useState, useCallback } from 'react';
import { Upload, FileText, Users, CheckCircle, AlertCircle, Trash2, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ChpData {
  fullName: string;
  phoneNumber: string;
  originalUsername: string;
  finalUsername: string;
  isValid: boolean;
  errors: string[];
  usernameExists: boolean;
  registrationStatus?: 'pending' | 'success' | 'failed';
  errorMessage?: string;
}

interface ValidationResult {
  validCount: number;
  invalidCount: number;
  totalCount: number;
  usernameConflicts: number;
  data: ChpData[];
}

interface ApiRegistrationRequest {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}

interface ConflictResolution {
  action: 'skip' | 'auto-rename' | 'reupload';
  conflictingUsernames: string[];
}

const ChpBulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictResolution, setConflictResolution] = useState<ConflictResolution | null>(null);
  const [isCheckingUsernames, setIsCheckingUsernames] = useState(false);
  const { toast } = useToast();

  const normalizePhoneNumber = (phone: string): string => {
    const cleanPhone = phone.trim();
    if (cleanPhone.startsWith('07')) {
      return '254' + cleanPhone.substring(1);
    }
    return cleanPhone;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phonePattern = /^[\+]?[1-9][\d]{3,14}$/;
    return phonePattern.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const normalizeUsername = (fullName: string): string => {
    return fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '.');
  };

  const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:9000/api/users/username/${username}`, {
        method: 'GET',
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.success === true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const generateUniqueUsername = async (baseUsername: string): Promise<string> => {
    let counter = 1;
    let testUsername = baseUsername;
    
    while (await checkUsernameExists(testUsername)) {
      testUsername = `${baseUsername}.${counter.toString().padStart(3, '0')}`;
      counter++;
      if (counter > 999) break; // Safety limit
    }
    
    return testUsername;
  };

  const validateChpData = async (data: any[]): Promise<ValidationResult> => {
    setIsCheckingUsernames(true);
    const processedData: ChpData[] = [];
    let usernameConflicts = 0;

    try {
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const fullName = row.fullName || row.FullName || row.FULLNAME || row.name || row.Name || row.NAME || '';
        const rawPhoneNumber = row.phoneNumber || row.phone || row.Phone || row.PHONE || row.PhoneNumber || row.PHONENUMBER || '';
        
        // Normalize phone number - convert 07XXXXXXXX to 25470XXXXXXXX
        const normalizedPhoneNumber = normalizePhoneNumber(rawPhoneNumber);
        
        const errors: string[] = [];
        
        if (!fullName.trim()) {
          errors.push('Full name is required');
        }
        
        if (!rawPhoneNumber.trim()) {
          errors.push('Phone number is required');
        } else if (!validatePhoneNumber(normalizedPhoneNumber)) {
          errors.push('Invalid phone number format');
        }

        const originalUsername = normalizeUsername(fullName);
        const usernameExists = originalUsername ? await checkUsernameExists(originalUsername) : false;
        
        if (usernameExists) {
          usernameConflicts++;
          errors.push('Username already exists');
        }

        processedData.push({
          fullName: fullName.trim(),
          phoneNumber: normalizedPhoneNumber, // Store the normalized phone number
          originalUsername,
          finalUsername: originalUsername,
          isValid: errors.length === 0,
          errors,
          usernameExists
        });

        // Update progress
        setUploadProgress(((i + 1) / data.length) * 50); // 50% for username checking
      }

      const validCount = processedData.filter(item => item.isValid).length;
      const invalidCount = processedData.length - validCount;

      return {
        validCount,
        invalidCount,
        totalCount: processedData.length,
        usernameConflicts,
        data: processedData
      };
    } finally {
      setIsCheckingUsernames(false);
    }
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
      reader.onload = async (e) => {
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

          setUploadProgress(25);
          
          const result = await validateChpData(jsonData);
          setValidationResult(result);
          setFile(uploadedFile);
          setUploadProgress(100);
          setIsRegistrationComplete(false);

          if (result.usernameConflicts > 0) {
            const conflictingUsernames = result.data
              .filter(item => item.usernameExists)
              .map(item => item.originalUsername);
            
            setConflictResolution({
              action: 'skip',
              conflictingUsernames
            });
            setShowConflictDialog(true);
          } else {
            toast({
              title: "File processed successfully",
              description: `Found ${result.totalCount} records (${result.validCount} valid, ${result.invalidCount} invalid)`,
            });
          }

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

  const handleConflictResolution = async (action: 'skip' | 'auto-rename' | 'reupload') => {
    if (!validationResult) return;

    if (action === 'reupload') {
      handleReset();
      setShowConflictDialog(false);
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const updatedData = [...validationResult.data];
      
      if (action === 'auto-rename') {
        // Generate unique usernames for conflicting ones
        for (let i = 0; i < updatedData.length; i++) {
          if (updatedData[i].usernameExists) {
            const uniqueUsername = await generateUniqueUsername(updatedData[i].originalUsername);
            updatedData[i].finalUsername = uniqueUsername;
            updatedData[i].usernameExists = false;
            updatedData[i].errors = updatedData[i].errors.filter(error => error !== 'Username already exists');
            updatedData[i].isValid = updatedData[i].errors.length === 0;
          }
          setUploadProgress(((i + 1) / updatedData.length) * 100);
        }
      } else if (action === 'skip') {
        // Mark conflicting users as invalid
        for (let i = 0; i < updatedData.length; i++) {
          if (updatedData[i].usernameExists) {
            updatedData[i].isValid = false;
          }
        }
      }

      const newValidCount = updatedData.filter(item => item.isValid).length;
      const newInvalidCount = updatedData.length - newValidCount;

      const newResult = {
        ...validationResult,
        validCount: newValidCount,
        invalidCount: newInvalidCount,
        usernameConflicts: action === 'skip' ? validationResult.usernameConflicts : 0,
        data: updatedData
      };

      setValidationResult(newResult);
      setShowConflictDialog(false);

      toast({
        title: "Conflicts resolved",
        description: action === 'auto-rename' 
          ? `Generated unique usernames for ${validationResult.usernameConflicts} users`
          : `Skipped ${validationResult.usernameConflicts} users with existing usernames`,
      });

    } catch (error) {
      toast({
        title: "Error resolving conflicts",
        description: "Failed to resolve username conflicts",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const email = `${chpData.finalUsername}${randomSuffix}@chp.org`;

    const registrationData: ApiRegistrationRequest = {
      username: chpData.finalUsername,
      email: email,
      phoneNumber: chpData.phoneNumber,
      password: "admin@123",
      role: "CHP"
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
    setShowConflictDialog(false);
    setConflictResolution(null);
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
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
                    ? 'border-primary bg-accent' 
                    : 'border-muted-foreground/25 hover:border-primary hover:bg-accent/50'
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
                  Excel file should contain columns: <strong>fullName</strong> and <strong>phoneNumber</strong>. Phone numbers starting with "07" will be automatically converted to international format (254). Usernames will be automatically generated and checked for uniqueness.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">{file.name}</span>
                  {isCheckingUsernames && (
                    <Badge variant="outline" className="ml-2">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Checking usernames...
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-1"
                  disabled={isProcessing}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </Button>
              </div>
              
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{isCheckingUsernames ? "Checking usernames..." : "Processing..."}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Username Conflict Resolution Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Username Conflicts Detected
            </DialogTitle>
            <DialogDescription>
              {conflictResolution?.conflictingUsernames.length} usernames already exist in the system. Choose how to handle these conflicts:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-md">
              <h4 className="font-medium mb-2">Conflicting Usernames:</h4>
              <div className="flex flex-wrap gap-2">
                {conflictResolution?.conflictingUsernames.map((username, index) => (
                  <Badge key={index} variant="outline" className="bg-orange-100 dark:bg-orange-900/20">
                    {username}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-md hover:bg-muted/50">
                <h4 className="font-medium">Auto-rename (Recommended)</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically generate unique usernames by adding numbers (e.g., john.doe.001, john.doe.002)
                </p>
              </div>
              
              <div className="p-3 border rounded-md hover:bg-muted/50">
                <h4 className="font-medium">Skip conflicting users</h4>
                <p className="text-sm text-muted-foreground">
                  Skip users with existing usernames and proceed with the rest
                </p>
              </div>
              
              <div className="p-3 border rounded-md hover:bg-muted/50">
                <h4 className="font-medium">Re-upload file</h4>
                <p className="text-sm text-muted-foreground">
                  Cancel and upload a different file with unique names
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => handleConflictResolution('reupload')}>
              Re-upload File
            </Button>
            <Button variant="outline" onClick={() => handleConflictResolution('skip')}>
              Skip Conflicts
            </Button>
            <Button onClick={() => handleConflictResolution('auto-rename')}>
              Auto-rename Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {validationResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Validation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300">
                  {validationResult.validCount} Valid
                </Badge>
                <Badge variant="outline" className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300">
                  {validationResult.invalidCount} Invalid
                </Badge>
                {validationResult.usernameConflicts > 0 && (
                  <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300">
                    {validationResult.usernameConflicts} Username Conflicts
                  </Badge>
                )}
                <Badge variant="outline">
                  {validationResult.totalCount} Total
                </Badge>
              </div>
              
              {(validationResult.invalidCount > 0 || validationResult.usernameConflicts > 0) && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationResult.invalidCount > 0 && `${validationResult.invalidCount} records have validation errors. `}
                    {validationResult.usernameConflicts > 0 && `${validationResult.usernameConflicts} usernames already exist. `}
                    Please review the table below.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="max-h-64 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Username</TableHead>
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
                          <div className="space-y-1">
                            <div className="text-sm">{item.finalUsername}</div>
                            {item.finalUsername !== item.originalUsername && (
                              <div className="text-xs text-muted-foreground">
                                Original: {item.originalUsername}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isValid ? "outline" : "destructive"}>
                            {item.isValid ? "Valid" : "Invalid"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.registrationStatus === 'pending' && (
                            <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300">
                              Registering...
                            </Badge>
                          )}
                          {item.registrationStatus === 'success' && (
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300">
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
                            <span className="text-red-500 block mt-1">
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
            <Card>
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
                    className="bg-green-600 hover:bg-green-700 text-white"
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
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-green-700 dark:text-green-300">Registration Complete!</h3>
                    <p className="text-sm text-muted-foreground">
                      Successfully registered {validationResult.validCount} CHPs
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2 bg-green-50 dark:bg-green-950/20 p-4 rounded-md">
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