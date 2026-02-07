"use client";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { DeleteConfirmation } from "./DeleteConfirmation";

async function deletePost(id) {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`, {
    method: "DELETE",
  });
}

const DeleteButton = ({ id }) => {
  const router = useRouter();
  const onDelete = async () => {
    toast.warn(
      <DeleteConfirmation
        message={`Are you sure you want to delete this post?`}
        onConfirm={async () => {
          await deletePost(id);
          toast.success("Post deleted successfully!");
          router.push("/");
        }}
      />,
      {
        position: "top-center",
        autoClose: false, // Penting: Jangan biarkan menutup otomatis
        closeOnClick: false, // Agar tidak tertutup saat area toast diklik
        draggable: false,
      },
    );
  };

  return (
    <button onClick={onDelete}>
      <FaTrash className="h-6 w-6 hover:text-red-500" />
    </button>
  );
};

export default DeleteButton;
