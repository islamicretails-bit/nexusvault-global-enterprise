// src/components/admin/CustomRequestsTable.ts
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma';
import { CustomRequest } from '../../../types';
import Table from '../../Table';
import TableHeader from '../../TableHeader';
import TableRow from '../../TableRow';
import TableCell from '../../TableCell';

interface CustomRequestsTableProps {
  customRequests: CustomRequest[];
}

const CustomRequestsTable: React.FC<CustomRequestsTableProps> = ({ customRequests }) => {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<CustomRequest[]>(customRequests);

  useEffect(() => {
    setRequests(customRequests);
  }, [customRequests]);

  const handleDeleteRequest = async (id: number) => {
    try {
      await prisma.customRequest.delete({
        where: {
          id,
        },
      });
      setRequests(requests.filter((request) => request.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableCell>ID</TableCell>
        <TableCell>Customer Name</TableCell>
        <TableCell>Request Description</TableCell>
        <TableCell>Status</TableCell>
        <TableCell>Actions</TableCell>
      </TableHeader>
      {requests.map((request) => (
        <TableRow key={request.id}>
          <TableCell>{request.id}</TableCell>
          <TableCell>{request.customerName}</TableCell>
          <TableCell>{request.requestDescription}</TableCell>
          <TableCell>{request.status}</TableCell>
          <TableCell>
            <button
              type="button"
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleDeleteRequest(request.id)}
            >
              Delete
            </button>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default CustomRequestsTable;

// src/types/index.ts
interface CustomRequest {
  id: number;
  customerName: string;
  requestDescription: string;
  status: string;
}

// src/components/Table.tsx
import React from 'react';

interface TableProps {
  children: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ children }) => {
  return (
    <table className="w-full table-auto">
      {children}
    </table>
  );
};

export default Table;

// src/components/TableHeader.tsx
import React from 'react';

interface TableHeaderProps {
  children: React.ReactNode;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
};

export default TableHeader;

// src/components/TableRow.tsx
import React from 'react';

interface TableRowProps {
  children: React.ReactNode;
}

const TableRow: React.FC<TableRowProps> = ({ children }) => {
  return (
    <tr className="border-b border-gray-200">{children}</tr>
  );
};

export default TableRow;

// src/components/TableCell.tsx
import React from 'react';

interface TableCellProps {
  children: React.ReactNode;
}

const TableCell: React.FC<TableCellProps> = ({ children }) => {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      {children}
    </td>
  );
};

export default TableCell;