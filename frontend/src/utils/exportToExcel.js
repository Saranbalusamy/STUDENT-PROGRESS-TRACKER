 // Utility function to export JSON data as Excel (.xlsx)
import * as XLSX from 'xlsx';

const exportToExcel = (data, filename = 'export.xlsx') => {
  // Prepare worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  // Create workbook and append worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  // Export to file
  XLSX.writeFile(wb, filename);
};

export default exportToExcel;
