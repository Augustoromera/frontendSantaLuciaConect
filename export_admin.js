const fs = require('fs');
const path = require('path');

const files = [
    'src/pages/admin/AdminScreen.jsx',
    'src/pages/admin/AdminContactScreen.jsx',
    'src/pages/admin/components/AdminSidebar.jsx',
    'src/pages/admin/components/UserManagement.jsx',
    'src/pages/admin/components/ScheduleManagement.jsx',
    'src/pages/styles/adminscreen.css',
    'src/components/admin-components/AddParadaModel.jsx',
    'src/components/admin-components/EditParadasModal.jsx',
    'src/components/admin-components/EditHorariosModal.jsx',
    'src/components/admin-components/AddUserModal.jsx',
    'src/components/admin-components/EditUserModal.jsx',
    'src/components/admin-components/AddHorarioModal.jsx'
];

const outFile = 'admin_panel_export.txt';
let content = 'EXPORTED ADMIN PANEL CODE\n\n';

console.log('Starting export...');

files.forEach(file => {
    try {
        const fullPath = path.resolve(__dirname, file);
        if (fs.existsSync(fullPath)) {
            const data = fs.readFileSync(fullPath, 'utf8');
            content += '==================================================================\n';
            content += `FILE: ${file}\n`;
            content += '==================================================================\n';
            content += data + '\n\n';
            console.log(`Read ${file}`);
        } else {
            console.error(`File not found: ${file}`);
            content += `ERROR: FILE NOT FOUND: ${file}\n\n`;
        }
    } catch (err) {
        console.error(`Error reading ${file}: ${err.message}`);
        content += `ERROR READING FILE: ${file} - ${err.message}\n\n`;
    }
});

fs.writeFileSync(outFile, content);
console.log(`Export complete. Written to ${outFile}`);
