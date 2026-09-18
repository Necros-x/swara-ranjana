"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { MailPlus, Plus, ShieldCheck, Trash2, UserRoundCog, X } from "lucide-react";
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
  deleteStaffMember,
  inviteStaff,
  resendStaffInvitation,
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
  if (role === "SELLER") return "Seller";
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

function PendingActionButton({
  children,
  pendingLabel,
  disabled,
  variant,
  size,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending || disabled}
      className={className}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
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
              <option value="SELLER">Seller</option>
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

      <PendingActionButton
        size="sm"
        pendingLabel="Saving…"
        className="w-full cursor-pointer disabled:cursor-not-allowed"
      >
        Save changes
      </PendingActionButton>
    </form>
  );
}

function StaffActions({
  member,
  currentUserId,
}: {
  member: StaffMember;
  currentUserId: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isCurrentUser = member.userId === currentUserId;

  if (isCurrentUser) {
    return (
      <div className="border-t border-[#E4E9ED] pt-3 text-[10px] font-medium uppercase tracking-[0.12em] text-[#7D8A95]">
        Current account
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-2 border-t border-[#E4E9ED] pt-3 sm:grid-cols-2">
        <form action={resendStaffInvitation}>
          <input type="hidden" name="userId" value={member.userId} />
          <PendingActionButton
            pendingLabel="Sending…"
            disabled={member.status !== "ACTIVE"}
            variant="outline"
            size="sm"
            className="h-9 w-full cursor-pointer text-[10px] font-semibold uppercase tracking-[0.1em] disabled:cursor-not-allowed"
          >
            <MailPlus className="mr-2 h-3.5 w-3.5" />
            Resend invite
          </PendingActionButton>
        </form>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="h-9 w-full cursor-pointer text-[10px] font-semibold uppercase tracking-[0.1em]"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete staff
        </Button>
      </div>

      {deleteOpen && (
        <div
          className="fixed inset-0 z-[180] flex items-end justify-center bg-[#0E1721]/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setDeleteOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-staff-${member.userId}`}
            className="w-full max-w-md bg-white p-6 shadow-2xl sm:rounded-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-red-600">
                  Destructive action
                </div>
                <h2
                  id={`delete-staff-${member.userId}`}
                  className="mt-2 font-gemola text-3xl font-light text-[#0E1721]"
                >
                  Delete staff access?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="cursor-pointer rounded-full p-2 text-[#7D8A95] transition hover:bg-[#F3F5F7] hover:text-[#0E1721]"
                aria-label="Close delete confirmation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#7D8A95]">
              <span className="font-semibold text-[#31465A]">
                {member.displayName}
              </span>{" "}
              will immediately lose staff access and disappear from Staff
              Management. Scanner, payment and refund audit history will be
              preserved.
            </p>

            <div className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
              Their authentication identity is kept for audit integrity and can
              be invited again later using the same email.
            </div>

            <form action={deleteStaffMember} className="mt-6 grid grid-cols-2 gap-3">
              <input type="hidden" name="userId" value={member.userId} />
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                className="cursor-pointer"
              >
                Keep staff
              </Button>
              <PendingActionButton
                variant="destructive"
                pendingLabel="Deleting…"
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                Delete staff
              </PendingActionButton>
            </form>
          </div>
        </div>
      )}
    </>
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
                  <option value="SELLER">Seller</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </label>

              <div className="md:col-span-3 flex justify-end">
                <PendingActionButton
                  pendingLabel="Sending invitation…"
                  className="w-full cursor-pointer sm:w-auto disabled:cursor-not-allowed"
                >
                  Send staff invitation
                </PendingActionButton>
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

                  <div className="mt-4 space-y-3">
                    <StaffEditor member={member} currentUserId={currentUserId} />
                    <StaffActions member={member} currentUserId={currentUserId} />
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
                          <div className="space-y-3">
                            <StaffEditor member={member} currentUserId={currentUserId} />
                            <StaffActions member={member} currentUserId={currentUserId} />
                          </div>
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
