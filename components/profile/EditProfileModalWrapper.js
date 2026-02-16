"use client";

import { usePathname, useRouter } from "next/navigation";
import EditProfileModal from "./EditProfileModal";

function EditProfileModalWrapper({ showEditModal, user }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClose = () => {
    // Hapus query param edit dari URL
    router.push(pathname);
  };

  if (!showEditModal) return null;

  return (
    <EditProfileModal
      user={user}
      isOpen={showEditModal}
      onClose={handleClose}
    />
  );
}

export default EditProfileModalWrapper;
