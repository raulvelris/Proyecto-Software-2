const InvitationSendingPage = () => {
    return (
        <div
            className="modal fade show d-flex align-items-center justify-content-center"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", minHeight: "100vh" }}
            aria-modal="true"
            role="dialog"
        >
            <div className="modal-dialog" style={{ maxWidth: "450px", width: "100%" }}>
                <div className="modal-content">
                    <div className="modal-header d-flex justify-content-center w-100 border-0">
                        <h4 className="modal-title">Invitar personas a Evento</h4>
                    </div>

                    <div className="modal-body text-start">
                        <p>Buscar por nombre de usuario</p>
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="bi bi-search"></i>
                            </span>               
                            <input type="search" className="form-control" placeholder="Encuentra usuarios" aria-label="Search"/>
                        </div>
                    </div>

                    <div className="modal-footer justify-content-end border-0">
                        <button type="button" className="btn btn-secondary me-2">
                            Cancelar
                        </button>
                        <button type="button" className="btn btn-primary">
                            Enviar invitaciones
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InvitationSendingPage
