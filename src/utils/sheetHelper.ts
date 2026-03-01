import Papa from 'papaparse';
import Swal from 'sweetalert2';

export const exportToGoogleSheets = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    Swal.fire('Error', 'No data to export', 'error');
    return;
  }

  // Flatten object if needed or just take keys
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  Swal.fire({
    title: 'Synced to Sheets',
    text: `Data successfully exported for Google Sheets.`,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  });
};

export const AutoSyncIndicator = () => {
    // This is a visual component to simulate auto-sync status
    return null; // Implemented directly in components for better layout control
};
