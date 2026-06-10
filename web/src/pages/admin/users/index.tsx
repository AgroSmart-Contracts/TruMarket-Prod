import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

import Users from "src/components/admin/users";
import Container from "src/components/common/container";

interface AdminProps {}

const Admin: React.FC<AdminProps> = () => {
  const { pathname } = useRouter();

  return (
    <Container>
      <div className="flex flex-col gap-[10px]">
        <div className="flex gap-[10px]">
          <Link
            href="/admin"
            className={`hover:text-tm-black rounded px-4 py-2  ${pathname === "/admin" ? "text-tm-black" : "text-tm-blue"}`}
          >
            Agreements
          </Link>
          <Link
            href="/admin/users"
            className={`hover:text-tm-black rounded px-4 py-2  ${pathname === "/admin/users" ? "text-tm-black" : "text-tm-blue"}`}
          >
            Users
          </Link>
        </div>

        <Users />
      </div>
    </Container>
  );
};

export default Admin;
