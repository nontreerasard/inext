export class ModalManager {
    static setupModalListeners() {
        // Close modal handlers
        document.querySelectorAll('.modal').forEach(modal => {
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.onclick = () => this.closeModal(modal);
            }

            // Click outside modal to close
            modal.onclick = (event) => {
                if (event.target === modal) {
                    this.closeModal(modal);
                }
            };
        });
    }

    static openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    }

    static closeModal(modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        if (modal.id === 'borrowModal') {
            document.getElementById('borrowForm')?.reset();
        }
    }
}
