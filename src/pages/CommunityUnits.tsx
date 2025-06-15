import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';
import { Layout } from '@/components/Layout'; // Import Layout

// Mock data (reuse from Dashboard)
const mockCommunityUnits = [
	{
		id: 1,
		name: 'Community Unit A',
		stocks: [
			{ commodity: 'Paracetamol', quantity: 120 },
			{ commodity: 'ORS', quantity: 80 },
		],
	},
	{
		id: 2,
		name: 'Community Unit B',
		stocks: [
			{ commodity: 'Zinc', quantity: 50 },
			{ commodity: 'Paracetamol', quantity: 30 },
		],
	},
	{
		id: 3,
		name: 'Community Unit C',
		stocks: [
			{ commodity: 'ORS', quantity: 0 },
			{ commodity: 'Zinc', quantity: 10 },
		],
	},
];

export const CommunityUnits = () => {
	return (
		<Layout>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
						<Users className="w-8 h-8 text-primary" />
						<span>Community Units & Stocks</span>
					</h1>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Community Units Stock Table</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Community Unit</TableHead>
									<TableHead>Commodity</TableHead>
									<TableHead>Quantity</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{mockCommunityUnits.map(unit =>
									unit.stocks.map((stock, idx) => (
										<TableRow key={unit.id + '-' + stock.commodity}>
											{idx === 0 && (
												<TableCell
													rowSpan={unit.stocks.length}
													className="font-medium"
												>
													{unit.name}
												</TableCell>
											)}
											<TableCell>{stock.commodity}</TableCell>
											<TableCell>{stock.quantity}</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
};

export default CommunityUnits;