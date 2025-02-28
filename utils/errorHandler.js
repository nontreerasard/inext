export const showError = (message) => {
    alert(message);
    console.error('Error:', message);
};

export const handleApiError = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'การดำเนินการล้มเหลว');
    }
    return response;
};
