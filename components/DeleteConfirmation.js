export const DeleteConfirmation = ({
  closeToast,
  onConfirm,
  message = "Yakin ingin menghapus data ini?",
}) => (
  <div className="flex flex-col p-4 rounded">
    <p className="mb-2">{message}</p>
    <div className="flex justify-end gap-2">
      <button onClick={closeToast} className="px-2 py-1 text-sm rounded">
        Cancel
      </button>
      <button
        onClick={() => {
          onConfirm();
          closeToast();
        }}
        className="px-2 py-1 text-sm bg-red-500 text-white rounded"
      >
        Delete
      </button>
    </div>
  </div>
);
