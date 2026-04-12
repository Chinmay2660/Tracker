import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHrContacts, HrContactInput } from '../hooks/useHrContacts';
import { useHrContactsColumnResize } from '../hooks/useHrContactsColumnResize';
import { useHrContactsSplitTableSync } from '../hooks/useHrContactsSplitTableSync';
import { HrContactRecord, HrCompanyType } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PageHeader } from '../components/PageHeader';
import { Select } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { HR_COMPANY_TYPE_OPTIONS } from '../lib/hrCompanyTypes';
import { HR_CONTACTS_DATA_COLUMNS } from '../lib/hrContactsDataColumns';
import {
  DEFAULT_HR_CONTACT_COL_WIDTHS,
  HR_ACTIONS_COL_PX,
  HR_ACTIONS_HEAD_CLASS,
  HR_ACTIONS_PANEL_BORDER,
  HR_CONTACTS_COL_WIDTHS_KEY,
  HR_RESIZE_HANDLE_CLASS,
  HR_TH_BASE,
  hrActionsBodyCellBg,
  loadStoredHrContactColWidths,
} from '../lib/hrContactsTable';
import { normalizePhoneDigits } from '../lib/phoneNormalize';
import { Plus, Pencil, Trash2, Building2, StickyNote } from 'lucide-react';

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
  const [colWidths, setColWidths] = useState<number[]>(() => loadStoredHrContactColWidths());

  const sortedContacts = useMemo(() => {
    return [...hrContacts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [hrContacts]);

  const dataTableWidthPx = useMemo(() => colWidths.reduce((s, w) => s + w, 0), [colWidths]);
  const dataScrollWidthPx = useMemo(() => Math.max(820, dataTableWidthPx), [dataTableWidthPx]);

  const tableSyncKey = `${sortedContacts.length}:${colWidths.join(',')}`;
  const { scrollAreaRef, dataTableRef, actionsTableRef } = useHrContactsSplitTableSync(tableSyncKey);
  const { beginResizeBetween, beginResizeLastRight } = useHrContactsColumnResize(colWidths, setColWidths);

  useEffect(() => {
    try {
      localStorage.setItem(HR_CONTACTS_COL_WIDTHS_KEY, JSON.stringify(colWidths));
    } catch {
      /* ignore */
    }
  }, [colWidths]);

  const resetColumnWidths = useCallback(() => {
    setColWidths([...DEFAULT_HR_CONTACT_COL_WIDTHS]);
    try {
      localStorage.removeItem(HR_CONTACTS_COL_WIDTHS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

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

  const lastColIndex = HR_CONTACTS_DATA_COLUMNS.length - 1;

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
      <PageHeader
        title="HR Contacts"
        description="Directory of recruiters and HR"
        actions={
          <>
            {sortedContacts.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-initial"
                onClick={resetColumnWidths}
                title="Restore default column widths"
              >
                Reset columns
              </Button>
            )}
            <Button
              onClick={openCreate}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add HR Contact
            </Button>
          </>
        }
      />

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
        <div className="flex items-start rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div
            className={`w-24 flex-shrink-0 overflow-x-hidden bg-white dark:bg-slate-900 ${HR_ACTIONS_PANEL_BORDER}`}
          >
            <table
              ref={actionsTableRef}
              className="w-full table-fixed border-collapse text-left text-sm"
              style={{ width: HR_ACTIONS_COL_PX, minWidth: HR_ACTIONS_COL_PX }}
            >
              <colgroup>
                <col style={{ width: HR_ACTIONS_COL_PX, minWidth: HR_ACTIONS_COL_PX }} />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th scope="col" className={HR_ACTIONS_HEAD_CLASS}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedContacts.map((row) => {
                  const isHovered = hoveredRowId === row._id;
                  const rowHover = isHovered ? 'bg-slate-50/80 dark:bg-slate-800/40' : '';
                  return (
                    <tr
                      key={row._id}
                      className={`border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${rowHover}`}
                      onMouseEnter={() => setHoveredRowId(row._id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <td
                        className={`box-border px-1.5 py-1.5 text-center align-middle ${hrActionsBodyCellBg(
                          isHovered
                        )}`}
                      >
                        <div className="inline-flex items-center justify-center gap-px leading-none">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 touch-manipulation"
                            onClick={() => openEdit(row)}
                            title="Edit"
                            type="button"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 dark:text-red-400 touch-manipulation"
                            onClick={() => setDeleteId(row._id)}
                            title="Delete"
                            type="button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            ref={scrollAreaRef}
            className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden touch-pan-x overscroll-x-contain bg-white dark:bg-slate-900"
          >
            <table
              ref={dataTableRef}
              className="table-fixed border-collapse text-left text-sm"
              style={{
                width: `${dataScrollWidthPx}px`,
                minWidth: `${dataScrollWidthPx}px`,
              }}
            >
              <colgroup>
                {colWidths.map((w, i) => (
                  <col key={i} style={{ width: w, minWidth: w }} />
                ))}
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  {HR_CONTACTS_DATA_COLUMNS.map((col, i) => (
                    <th key={col.title} scope="col" className={HR_TH_BASE}>
                      <span className="block min-w-0 truncate" title={col.title}>
                        {col.title}
                      </span>
                      <div
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={col.ariaResize}
                        title={i === lastColIndex ? 'Drag to widen or narrow this column' : 'Drag to resize'}
                        className={HR_RESIZE_HANDLE_CLASS}
                        onPointerDown={i === lastColIndex ? beginResizeLastRight : (e) => beginResizeBetween(i, e)}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedContacts.map((row) => {
                  const isHovered = hoveredRowId === row._id;
                  const rowHover = isHovered ? 'bg-slate-50/80 dark:bg-slate-800/40' : '';
                  return (
                    <tr
                      key={row._id}
                      className={`border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${rowHover}`}
                      onMouseEnter={() => setHoveredRowId(row._id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      {HR_CONTACTS_DATA_COLUMNS.map((col) => (
                        <td key={col.title} className={col.tdClass}>
                          {col.render(row)}
                        </td>
                      ))}
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
