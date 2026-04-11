import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useHrContacts, HrContactInput } from '../hooks/useHrContacts';
import { HrContactRecord, HrCompanyType } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { HR_COMPANY_TYPE_LABELS, HR_COMPANY_TYPE_OPTIONS } from '../lib/hrCompanyTypes';
import { formatHrContactCompanyDisplay } from '../lib/hrContactDisplay';
import { normalizePhoneDigits } from '../lib/phoneNormalize';
import { Plus, Pencil, Trash2, Phone, Building2, User, StickyNote } from 'lucide-react';

const emptyForm: HrContactInput = {
  companyName: '',
  intermediaryCompanyName: '',
  hrName: '',
  phone: '',
  email: '',
  noticePeriodLwdNote: '',
  companyType: undefined,
};

function hasAtLeastOneHrField(f: HrContactInput): boolean {
  if (f.companyName.trim()) return true;
  if (f.intermediaryCompanyName.trim()) return true;
  if (f.hrName.trim()) return true;
  if (normalizePhoneDigits(f.phone)) return true;
  if (f.email?.trim()) return true;
  if ((f.noticePeriodLwdNote ?? '').trim()) return true;
  if (f.companyType) return true;
  return false;
}

function isDuplicatePhoneForUser(
  digits: string,
  contacts: HrContactRecord[],
  excludeId?: string
): boolean {
  if (!digits) return false;
  return contacts.some((c) => {
    if (excludeId && c._id === excludeId) return false;
    const n = c.phoneNormalized ?? normalizePhoneDigits(c.phone ?? '');
    return n.length > 0 && n === digits;
  });
}

export default function HrContactsPage() {
  const {
    hrContacts,
    isLoading,
    createHrContact,
    updateHrContact,
    deleteHrContact,
    isSaving,
    isDeleting,
  } = useHrContacts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HrContactRecord | null>(null);
  const [form, setForm] = useState<HrContactInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const leftTableRef = useRef<HTMLTableElement>(null);
  const rightTableRef = useRef<HTMLTableElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const sortedContacts = useMemo(() => {
    return [...hrContacts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [hrContacts]);

  const syncHrTableRowHeights = useCallback(() => {
    const left = leftTableRef.current;
    const right = rightTableRef.current;
    if (!left || !right || sortedContacts.length === 0) return;

    const leftRows = left.querySelectorAll(':scope > thead > tr, :scope > tbody > tr');
    const rightRows = right.querySelectorAll(':scope > thead > tr, :scope > tbody > tr');
    if (leftRows.length !== rightRows.length) return;

    leftRows.forEach((leftTr, i) => {
      const rightTr = rightRows[i] as HTMLElement;
      const h = Math.ceil((leftTr as HTMLElement).getBoundingClientRect().height);
      rightTr.style.height = `${h}px`;
      rightTr.style.minHeight = `${h}px`;
    });
  }, [sortedContacts]);

  useLayoutEffect(() => {
    syncHrTableRowHeights();
    const scrollEl = scrollAreaRef.current;
    const ro =
      scrollEl && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => syncHrTableRowHeights())
        : null;
    ro?.observe(scrollEl!);
    window.addEventListener('resize', syncHrTableRowHeights);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', syncHrTableRowHeights);
    };
  }, [syncHrTableRowHeights, sortedContacts]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: HrContactRecord) => {
    setEditing(row);
    setForm({
      companyName: row.companyName ?? '',
      intermediaryCompanyName: row.intermediaryCompanyName ?? '',
      hrName: row.hrName ?? '',
      phone: row.phone ?? '',
      email: row.email ?? '',
      noticePeriodLwdNote: row.noticePeriodLwdNote ?? '',
      companyType: row.companyType,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!hasAtLeastOneHrField(form)) {
      setFormError('Fill in at least one field before saving.');
      return;
    }
    const phoneDigits = normalizePhoneDigits(form.phone);
    if (phoneDigits && isDuplicatePhoneForUser(phoneDigits, sortedContacts, editing?._id)) {
      setFormError('This phone number is already used for another HR contact.');
      return;
    }
    try {
      const payload: HrContactInput = {
        companyName: form.companyName.trim(),
        intermediaryCompanyName: form.intermediaryCompanyName.trim(),
        hrName: form.hrName.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || undefined,
        noticePeriodLwdNote: form.noticePeriodLwdNote?.trim() ?? '',
        companyType: form.companyType,
      };
      if (editing) {
        await updateHrContact({ id: editing._id, ...payload });
      } else {
        await createHrContact(payload);
      }
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: unknown } } };
      const raw = axiosErr?.response?.data?.error;
      const msg =
        typeof raw === 'string'
          ? raw
          : Array.isArray(raw)
            ? 'Please check the form fields.'
            : 'Could not save HR contact.';
      setFormError(msg);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHrContact(deleteId);
      setDeleteId(null);
    } catch {
      /* toast in hook */
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">HR Contacts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Directory of recruiters and HR
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add HR Contact
        </Button>
      </div>

      {sortedContacts.length === 0 ? (
        <Card className="border-dashed border-slate-200 dark:border-slate-800">
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No HR contacts yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Save company HR details here. When you schedule interviews, you can link one of these contacts.
            </p>
            <Button onClick={openCreate} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add your first contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {/* Scrollbar only spans data columns — Actions stays outside the scroll area */}
          <div
            ref={scrollAreaRef}
            className="min-w-0 flex-1 overflow-x-auto touch-pan-x overscroll-x-contain"
          >
            <table
              ref={leftTableRef}
              className="w-full min-w-[820px] table-fixed text-sm border-collapse"
            >
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th
                    scope="col"
                    className="w-[20%] px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Company
                  </th>
                  <th
                    scope="col"
                    className="w-[11%] px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="w-[15%] px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200"
                  >
                    HR contact
                  </th>
                  <th
                    scope="col"
                    className="w-[17%] px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="w-[14%] px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="w-[23%] px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Notice / LWD
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedContacts.map((row) => {
                  const rowHover =
                    hoveredRowId === row._id
                      ? 'bg-slate-50/80 dark:bg-slate-800/40'
                      : '';
                  return (
                    <tr
                      key={row._id}
                      className={`border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${rowHover}`}
                      onMouseEnter={() => setHoveredRowId(row._id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <td className="px-4 py-3 align-top text-left">
                        <div className="flex items-start gap-2 min-w-0">
                          <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" aria-hidden />
                          <span className="font-medium text-slate-900 dark:text-white break-words min-w-0">
                            {formatHrContactCompanyDisplay(row)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-center whitespace-nowrap">
                        <span className="inline-flex text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 max-w-full truncate">
                          {row.companyType
                            ? HR_COMPANY_TYPE_LABELS[row.companyType]
                            : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-left text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" aria-hidden />
                          <span className="min-w-0 truncate">{row.hrName?.trim() || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-left text-slate-600 dark:text-slate-400">
                        <span className="block truncate" title={row.email ?? undefined}>
                          {row.email ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-left text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" aria-hidden />
                          <span className="tabular-nums">{row.phone?.trim() || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-left text-slate-600 dark:text-slate-400">
                        {row.noticePeriodLwdNote ? (
                          <span
                            className="line-clamp-2 break-words"
                            title={row.noticePeriodLwdNote}
                          >
                            {row.noticePeriodLwdNote}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="w-[108px] flex-shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table ref={rightTableRef} className="w-full text-sm text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th
                    scope="col"
                    className="px-2 py-3 font-semibold text-slate-700 dark:text-slate-200 text-center whitespace-nowrap"
                  >
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedContacts.map((row) => {
                  const rowHover =
                    hoveredRowId === row._id
                      ? 'bg-slate-50/80 dark:bg-slate-800/40'
                      : '';
                  return (
                    <tr
                      key={row._id}
                      className={`border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${rowHover}`}
                      onMouseEnter={() => setHoveredRowId(row._id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <td className="px-2 py-3 align-top text-center">
                        <div className="inline-flex items-center justify-center gap-0.5 pt-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 touch-manipulation"
                            onClick={() => openEdit(row)}
                            title="Edit"
                            type="button"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-red-600 hover:text-red-700 dark:text-red-400 touch-manipulation"
                            onClick={() => setDeleteId(row._id)}
                            title="Delete"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)} className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit HR contact' : 'Add HR contact'}</DialogTitle>
            <DialogDescription>
              All fields are optional, but at least one must be filled. The same phone number cannot be saved twice.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="companyType">Company Type</Label>
              <Select
                id="companyType"
                value={form.companyType ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({
                    ...f,
                    companyType: v === '' ? undefined : (v as HrCompanyType),
                  }));
                }}
              >
                <option value="">Select Type (Optional)</option>
                {HR_COMPANY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            {form.companyType === 'consultancy' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="intermediaryCompanyName">HR Consultancy Name</Label>
                  <Input
                    id="intermediaryCompanyName"
                    value={form.intermediaryCompanyName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, intermediaryCompanyName: e.target.value }))
                    }
                    placeholder="Agency or consultancy you deal with"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                    placeholder="Client company they are hiring for"
                  />
                </div>
              </>
            )}
            {form.companyType === 'third_party_payroll' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="intermediaryCompanyNamePayroll">Third Party Company Name</Label>
                  <Input
                    id="intermediaryCompanyNamePayroll"
                    value={form.intermediaryCompanyName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, intermediaryCompanyName: e.target.value }))
                    }
                    placeholder="Payroll or staffing company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyNamePayroll">Client Name</Label>
                  <Input
                    id="companyNamePayroll"
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                    placeholder="Where you work on paper / end client"
                  />
                </div>
              </>
            )}
            {form.companyType !== 'consultancy' && form.companyType !== 'third_party_payroll' && (
              <div className="space-y-2">
                <Label htmlFor="companyNameSimple">Company Name</Label>
                <Input
                  id="companyNameSimple"
                  value={form.companyName}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                  placeholder="Acme Corp"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="hrName">HR / Recruiter Name</Label>
              <Input
                id="hrName"
                value={form.hrName}
                onChange={(e) => setForm((f) => ({ ...f, hrName: e.target.value }))}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="hr@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noticePeriodLwdNote" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Notice Period &amp; LWD (What you told this recruiter)
              </Label>
              <textarea
                id="noticePeriodLwdNote"
                value={form.noticePeriodLwdNote ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, noticePeriodLwdNote: e.target.value }))}
                placeholder="e.g. Told them I’m on 2 months NP, LWD 15 May; or immediate joiner; or serving notice…"
                rows={4}
                maxLength={5000}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-y min-h-[96px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {(form.noticePeriodLwdNote ?? '').length}/5000
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 text-white">
                {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Add contact'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent onClose={() => setDeleteId(null)}>
          <DialogHeader>
            <DialogTitle>Delete HR contact?</DialogTitle>
            <DialogDescription>
              Interviews linked to this contact will no longer show the HR details. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
