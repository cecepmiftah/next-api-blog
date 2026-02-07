"use client";
import Link from "next/link";
import { FaRedoAlt } from "react-icons/fa";

const UpdateButton = ({ id }) => {
  return (
    <Link href={`/posts/update/${id}`}>
      <FaRedoAlt className="h-6 w-6" />
    </Link>
  );
};

export default UpdateButton;
