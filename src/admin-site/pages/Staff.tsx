"use client";

import React, { useState } from "react";
import { Plus, ShieldCheck, UserRoundCog, X } from "lucide-react";
import { Badge } from "@/admin-site/components/ui/Badge";
import { Button } from "@/admin-site/components/ui/Button";
import { Card, CardContent } from "@/admin-site/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/admin-site/components/ui/Table";
import {
  inviteStaff,
  updateStaffMember,
} from "@/app/admin/actions/staff";
import type { StaffRole, StaffStatus } from "@/types/database";

interface StaffMember {
  userId: string;
  displayName: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string | null;
  invitedAt: string | null;
  confirmedAt: string | null;
}

function roleLabel(role: StaffRole) {
  if (role === "SUPER_ADMIN") return "Super Admin";
  if (role === "ADMIN") return "Admin";
  if (role === "BOX_OFFICE") return "Swara Ranjana Staff";
  return "Scanner";
}

function dateLabel(value: string | null) {
  if (!value) return "Not yet";
  return new Date(value).toLocaleString("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Colombo",
  });
}

function statusVariant(status: StaffStatus) {
  return status === "ACTIVE" ? "success" : "secondary";
}

function StaffEditor({
  member,
  currentUserId,
}: {
  member: StaffMember;
  currentUserId: string;
}) {
  const isCurrentUser = member.userId === currentUserId;

  return (
    <form action={updateStaffMember} className="space-y-3">
      <input type="hidden" name="userId" value={member.userId} />

      <label className="block space-y-1">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#7D8A95]">
          Display name
        </span>
        <input
          name="displayName"
          required
          defaultValue={member.displayName}
          className="h-9 w-full border border-[#C2CBD2]/70 bg-white px-2.5 text-xs outline-none focus:border-[#2271B1]"
        />
      </label>

      {isCurrentUser ? (
        <>
          <input type="hidden" name="role" value={member.role} />
          <input type="hidden" name="status" value={member.status} />
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-[#C2CBD2]/60 bg-[#F7F9FA] px-3 py-2">
              <div className="text-[9px] uppercase tracking-[0.12em] text-[#7D8A95]">Role</div>
              <div className="mt-1 text-xs font-medium">{roleLabel(member.role)}</div>
            </div>
            <div className="border border-[#C2CBD2]/60 bg-[#F7F9FA] px-3 py-2">
              <div className="text-[9px] uppercase tracking-[0.12em] text-[#7D8A95]">Status</div>
              <div className="mt-1 text-xs font-medium">{member.status}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#7D8A95]">
              Role
            </span>
            <select
              name="role"
              defaultValue={member.role}
              className="h-9 w-full cursor-pointer border border-[#C2CBD2]/70 bg-white px-2 text-xs outline-none focus:border-[#2271B1]"
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="BOX_OFFICE">Swara Ranjana Staff</option>
              <option value="SCANNER">Scanner</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#7D8A95]">
              Status
            </span>
            <select
              name="status"
              defaultValue={member.status}
              className="h-9 w-full cursor-pointer border border-[#C2CBD2]/70 bg-white px-2 text-xs outline-none focus:border-[#2271B1]"
            >
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </label>
        </div>
      )}

      <Button type="submit" size="sm" className="w-full cursor-pointer">
        Save changes
      </Button>
    </form>
  );
}

export default function Staff({
  members,
  currentUserId,
  successMessage,
  errorMessage,
}: {
  members: StaffMember[];
  currentUserId: string;
  successMessage?: string;
  errorMessage?: string;
}) {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#0E1721]">
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-[#7D8A95]">
            Live Supabase Auth accounts and staff access roles.
          </p>
        </div>
        <Button
          className="w-full cursor-pointer sm:w-auto"
          onClick={() => setShowInvite(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Invite Staff
        </Button>
      </div>

      {successMessage && (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {showInvite && (
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#2271B1]">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                    Secure invitation
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-[#0E1721]">
                  Invite a staff member
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#7D8A95]">
                  They will receive a one-time setup code by email and choose their
                  own admin password. Access is controlled by the role stored here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="cursor-pointer p-2 text-[#7D8A95] hover:text-[#0E1721]"
                aria-label="Close invitation form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={inviteStaff} className="mt-6 grid gap-4 md:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">Display name</span>
                <input
                  name="displayName"
                  required
                  className="h-10 w-full border border-[#C2CBD2]/70 px-3 text-sm outline-none focus:border-[#2271B1]"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  className="h-10 w-full border border-[#C2CBD2]/70 px-3 text-sm outline-none focus:border-[#2271B1]"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">Role</span>
                <select
                  name="role"
                  defaultValue="SCANNER"
                  className="h-10 w-full cursor-pointer border border-[#C2CBD2]/70 bg-white px-3 text-sm outline-none focus:border-[#2271B1]"
                >
                  <option value="SCANNER">Scanner</option>
                  <option value="BOX_OFFICE">Swara Ranjana Staff</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </label>

              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" className="w-full cursor-pointer sm:w-auto">
                  Send staff invitation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {members.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-[#7D8A95]">
            No staff profiles found.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {members.map((member) => (
              <Card key={member.userId}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{member.displayName}</span>
                        {member.userId === currentUserId && (
                          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#2271B1]">
                            You
                          </span>
                        )}
                      </div>
                      <div className="mt-1 truncate text-xs text-[#7D8A95]">{member.email}</div>
                    </div>
                    <Badge variant={statusVariant(member.status)}>{member.status}</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[#E4E9ED] py-3 text-xs">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.12em] text-[#7D8A95]">Role</div>
                      <div className="mt-1 font-medium">{roleLabel(member.role)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.12em] text-[#7D8A95]">Last active</div>
                      <div className="mt-1 font-medium">{dateLabel(member.lastActiveAt)}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <StaffEditor member={member} currentUserId={currentUserId} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="min-w-[300px]">Access Controls</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <UserRoundCog className="mt-0.5 h-4 w-4 shrink-0 text-[#2271B1]" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{member.displayName}</span>
                                {member.userId === currentUserId && (
                                  <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#2271B1]">You</span>
                                )}
                              </div>
                              <span className="block max-w-[230px] truncate text-xs text-[#7D8A95]">
                                {member.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#31465A] bg-[#31465A]/5 text-[#31465A]">
                            {roleLabel(member.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(member.status)}>{member.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[#7D8A95]">
                          {dateLabel(member.lastActiveAt)}
                        </TableCell>
                        <TableCell>
                          <StaffEditor member={member} currentUserId={currentUserId} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
