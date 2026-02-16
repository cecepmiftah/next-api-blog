"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import EditProfileModal from "@/components/profile/EditProfileModal";

export default function EditProfileModalPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Fetch user data for the modal
      const fetchUserData = async () => {
        try {
          const response = await fetch(`/api/users/me`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data.data);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    } else if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [session, status, router]);

  const handleClose = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-8">
          <FaSpinner className="text-4xl text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <EditProfileModal user={userData} isOpen={true} onClose={handleClose} />
  );
}
