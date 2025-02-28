document.addEventListener('DOMContentLoaded', function() {
    const importForm = document.getElementById('importForm');
    const fileInput = document.getElementById('fileInput');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    importForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file) {
            alert('กรุณาเลือกไฟล์ Excel');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:3000/api/import', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                alert('นำเข้าข้อมูลสำเร็จ');
                window.location.reload();
            } else {
                throw new Error(result.message || 'การนำเข้าล้มเหลว');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    });

    fileInput.addEventListener('change', function(e) {
        const fileName = e.target.files[0]?.name;
        if (fileName) {
            document.getElementById('fileLabel').textContent = fileName;
        }
    });
});