import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertDate(timestamp: string | number | bigint | unknown) {
  console.log(timestamp);
  
  const numericTimestamp = typeof timestamp === 'bigint' ? Number(timestamp) : Number(timestamp);
  
  const date = new Date(numericTimestamp * 1000);
  
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  
  return `${day} ${month}, ${year}`;
}

export function taskStatus(status: number) {
  switch (status) {
    case 0:
      return "OPEN";
    case 1:
      return "ASSIGNED";
    case 2:
      return "IN_PROGRESS";
    case 3:
      return "SUBMITTED";
    case 4:
      return "COMPLETED";
    case 5:
      return "DISPUTED";
    case 6:
      return "CANCELLED"; 
    default:
      return "OPEN";
  }
}

export function taskStatusColor(status: number) {
  switch (status) {
    case 0:
      return "text-blue-500";
    case 1:
      return "text-yellow-500";
    case 2:
      return "text-green-500";
    case 3:
      return "text-red-500";
    default:
      return "text-blue-500";
  }
}

export function taskStatusBgColor(status: number) {
  switch (status) {
    case 0:
      return "bg-blue-100";
    case 1:
      return "bg-yellow-100";
    case 2:
      return "bg-green-100";
    case 3:
      return "bg-red-100";
    default:
      return "bg-blue-100";
  }
}