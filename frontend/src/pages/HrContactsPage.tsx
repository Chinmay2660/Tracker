import { useMemo, useState } from 'react';
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
import { Plus, Pencil, Trash2, Phone, Building2, User, StickyNote } from 'lucide-react';

const emptyForm: HrContactInput = {
  companyName: '',
  hrName: '',
  phone: '',
  email: '',
  noticePeriodLwdNote: '',
  companyType: 'service_based',
};

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

  const sortedContacts = useMemo(() => {
    return [...hrContacts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [hrContacts]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: HrContactRecord) => {
    setEditing(row);
    setForm({
      companyName: row.companyName,
      hrName: row.hrName,
      phone: row.phone,
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
    if (!form.companyName.trim() || !form.hrName.trim() || !form.phone.trim()) {
      setFormError('Company name, HR name, and phone are required.');
      return;
    }
    try {
      const payload: HrContactInput = {
        companyName: form.companyName.trim(),
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
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full min-w-[920px] text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <th scope="col" className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                  Company
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                  HR contact
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  Phone
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 min-w-[180px] max-w-[280px]">
                  Notice / LWD
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 text-right w-[1%]">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedContacts.map((row) => (
                <tr
                  key={row._id}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0" aria-hidden />
                      <span className="font-medium text-slate-900 dark:text-white truncate">{row.companyName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <span className="inline-flex text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {HR_COMPANY_TYPE_LABELS[row.companyType as HrCompanyType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-800 dark:text-slate-200">
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" aria-hidden />
                      {row.hrName}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600 dark:text-slate-400 max-w-[200px]">
                    <span className="truncate block" title={row.email ?? undefined}>
                      {row.email ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" aria-hidden />
                      {row.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600 dark:text-slate-400 max-w-[280px]">
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
                  <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-0.5 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => openEdit(row)}
                        title="Edit"
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 dark:text-red-400"
                        onClick={() => setDeleteId(row._id)}
                        title="Delete"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)} className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit HR contact' : 'Add HR contact'}</DialogTitle>
            <DialogDescription>
              Classify the company type. The same phone number cannot be added twice.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name *</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                placeholder="Acme Corp"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hrName">HR / recruiter name *</Label>
              <Input
                id="hrName"
                value={form.hrName}
                onChange={(e) => setForm((f) => ({ ...f, hrName: e.target.value }))}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                inputMode="tel"
                autoComplete="tel"
                required
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
                Notice period &amp; LWD (what you told this recruiter)
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
            <div className="space-y-2">
              <Label htmlFor="companyType">Company type *</Label>
              <Select
                id="companyType"
                value={form.companyType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, companyType: e.target.value as HrCompanyType }))
                }
              >
                {HR_COMPANY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
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
