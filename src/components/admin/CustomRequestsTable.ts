// src/components/admin/CustomRequestsTable.ts
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma';
import { CustomRequest } from '../../../types';
import { AiOutlineSearch } from 'react-icons/ai';
import { AiOutlineDelete } from 'react-icons/ai';
import { AiOutlineEdit } from 'react-icons/ai';
import { AiOutlineEye } from 'react-icons/ai';

interface Props {
  customRequests: CustomRequest[];
}

const CustomRequestsTable: React.FC<Props> = ({ customRequests }) => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomRequests, setFilteredCustomRequests] = useState(customRequests);

  useEffect(() => {
    const filteredRequests = customRequests.filter((request) =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomRequests(filteredRequests);
  }, [searchTerm, customRequests]);

  const handleDelete = async (id: number) => {
    try {
      await prisma.customRequest.delete({
        where: {
          id,
        },
      });
      const updatedCustomRequests = customRequests.filter((request) => request.id !== id);
      setFilteredCustomRequests(updatedCustomRequests);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (id: number) => {
    // Implement edit functionality
  };

  const handleView = (id: number) => {
    // Implement view functionality
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-bold">Custom Requests</h2>
        <div className="flex items-center">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search custom requests"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <AiOutlineSearch className="ml-2 text-gray-500" size={20} />
        </div>
      </div>
      <table className="w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomRequests.map((request) => (
            <tr key={request.id}>
              <td className="px-4 py-2">{request.title}</td>
              <td className="px-4 py-2">{request.description}</td>
              <td className="px-4 py-2">{request.status}</td>
              <td className="px-4 py-2 flex items-center">
                <AiOutlineEye
                  className="mr-2 text-gray-500 cursor-pointer"
                  size={20}
                  onClick={() => handleView(request.id)}
                />
                <AiOutlineEdit
                  className="mr-2 text-gray-500 cursor-pointer"
                  size={20}
                  onClick={() => handleEdit(request.id)}
                />
                <AiOutlineDelete
                  className="text-red-500 cursor-pointer"
                  size={20}
                  onClick={() => handleDelete(request.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomRequestsTable;