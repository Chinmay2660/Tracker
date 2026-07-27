import { useEffect, useMemo, useState } from 'react';
import { HR_CONTACTS_DEFAULT_PAGE_SIZE, HR_CONTACTS_PAGE_SIZES, useHrContacts, HrContactInput, type HrContactsPageSize, } from '../hooks/useHrContacts';
import { HrContactRecord, HrCompanyType } from '../types';
import { filterHrContactsList } from '../lib/hrContactFilter';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PageHeader } from '../components/PageHeader';
import { Select } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { HR_COMPANY_TYPE_LABELS, HR_COMPANY_TYPE_OPTIONS, HR_COMPANY_TYPE_SHORT_LABEL, } from '../lib/hrCompanyTypes';
import { HR_ACTIONS_TD_CLASS, HR_ACTIONS_TH_CLASS, HR_COMPANY_NAME_CHIP_CLASS, HR_COMPANY_TYPE_BADGE_CLASS, HR_CONSULTANCY_CLIENT_CHIP_CLASS, HR_INTERMEDIARY_PLAIN_TEXT_CLASS, HR_THIRD_PARTY_CLIENT_CHIP_CLASS, HR_TH_BASE, } from '../lib/hrContactsClasses';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { HrContactCompanyChips } from '../lib/hrContactCompanyChips';
import { getHrContactsDataColumns } from '../lib/hrContactsDataColumns';
import { HR_TABLE_COL_WIDTH_PERCENT } from '../lib/hrContactsTable';
import { mailtoHrefFromEmail, normalizePhoneDigits, telHrefFromPhone, validatePhoneInput } from '../lib/phoneNormalize';
import { Plus, Pencil, Trash2, Building2, StickyNote, Eye, ChevronLeft, ChevronRight, Share2, Copy, Link2Off, Search } from 'lucide-react';
import { useHrContactShare } from '../hooks/useHrContactShare';
const emptyForm: HrContactInput = {
    companyName: '',
    intermediaryCompanyName: '',
    hrName: '',
    phone: '',
    email: '',
    noticePeriodLwdNote: '',
    companyType: undefined,
    shareable: false,
};
function hasAtLeastOneHrField(f: HrContactInput): boolean {
    if (f.companyName.trim())
        return true;
    if (f.intermediaryCompanyName.trim())
        return true;
    if (f.hrName.trim())
        return true;
    if (normalizePhoneDigits(f.phone))
        return true;
    if (f.email?.trim())
        return true;
    if ((f.noticePeriodLwdNote ?? '').trim())
        return true;
    if (f.companyType)
        return true;
    return false;
}
export default function HrContactsPage() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<HrContactsPageSize>(HR_CONTACTS_DEFAULT_PAGE_SIZE);
    const [searchQuery, setSearchQuery] = useState('');
    const [companyTypeFilter, setCompanyTypeFilter] = useState('all');
    const [shareableFilter, setShareableFilter] = useState<'all' | 'shareable' | 'private'>('all');
    const { hrContacts: allContacts, isLoading, createHrContact, updateHrContact, deleteHrContact, isSaving, isDeleting, } = useHrContacts({
        paginate: false,
    });
    const filteredContacts = useMemo(
        () => filterHrContactsList(allContacts, searchQuery, companyTypeFilter, shareableFilter),
        [allContacts, searchQuery, companyTypeFilter, shareableFilter],
    );
    const listTotal = filteredContacts.length;
    const listTotalPages = Math.max(1, Math.ceil(listTotal / pageSize));
    const hrContacts = filteredContacts.slice((page - 1) * pageSize, page * pageSize);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<HrContactRecord | null>(null);
    const [form, setForm] = useState<HrContactInput>(emptyForm);
    const [formError, setFormError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewing, setViewing] = useState<HrContactRecord | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const { share, isLoading: isShareLoading, enableShare, revokeShare, isEnabling, isRevoking } = useHrContactShare();
    const dataColumns = useMemo(() => getHrContactsDataColumns(), []);
    useEffect(() => {
        if (listTotal === 0) {
            if (page !== 1) setPage(1);
            return;
        }
        if (page > listTotalPages) setPage(listTotalPages);
    }, [listTotal, listTotalPages, page]);
    useEffect(() => {
        setPage(1);
    }, [searchQuery, companyTypeFilter, shareableFilter, pageSize]);
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
            shareable: row.shareable ?? false,
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
        const phoneError = validatePhoneInput(form.phone);
        if (phoneError) {
            setFormError(phoneError);
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
                shareable: form.shareable ?? false,
            };
            if (editing) {
                await updateHrContact({ id: editing._id, ...payload });
            }
            else {
                await createHrContact(payload);
            }
            setDialogOpen(false);
            setEditing(null);
            setForm(emptyForm);
        }
        catch (err: unknown) {
            const axiosErr = err as {
                response?: {
                    data?: {
                        error?: unknown;
                    };
                };
            };
            const raw = axiosErr?.response?.data?.error;
            const msg = typeof raw === 'string'
                ? raw
                : Array.isArray(raw)
                    ? 'Please check the form fields.'
                    : 'Could not save HR contact.';
            setFormError(msg);
        }
    };
    const confirmDelete = async () => {
        if (!deleteId) {
            return;
        }
        await deleteHrContact(deleteId);
        setDeleteId(null);
    };
    const copyShareUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        }
        catch {
            toast.error('Could not copy link');
        }
    };
    if (isLoading) {
        return (<div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Skeleton className="h-7 w-48 mb-2"/>
            <Skeleton className="h-4 w-72"/>
          </div>
          <Skeleton className="h-10 w-40"/>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (<Skeleton key={i} className="h-12 w-full rounded-md"/>))}
          </div>
        </div>
      </div>);
    }
    return (<div className="space-y-4 sm:space-y-6">
      <PageHeader title="HR Contacts" description="Directory of recruiters and HR" actions={<>
            <Button variant="outline" onClick={() => setShareDialogOpen(true)} className="flex-1 sm:flex-initial">
              <Share2 className="h-4 w-4 mr-2"/>
              Share list
            </Button>
            <Button onClick={openCreate} className="flex-1 sm:flex-initial bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-2"/>
              Add HR Contact
            </Button>
          </>}/>

      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search by company, name, phone, or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={companyTypeFilter} onChange={(e) => setCompanyTypeFilter(e.target.value)} className="sm:w-44">
          <option value="all">All company types</option>
          {HR_COMPANY_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
        <Select value={shareableFilter} onChange={(e) => setShareableFilter(e.target.value as 'all' | 'shareable' | 'private')} className="sm:w-36">
          <option value="all">All contacts</option>
          <option value="shareable">Shareable</option>
          <option value="private">Private</option>
        </Select>
      </div>

      {listTotal !== undefined && listTotal > 0 && (<div className="rounded-lg border border-slate-200/90 bg-slate-50/90 px-3 py-2.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300" role="note" aria-label="Company column color key">
          <p className="font-medium text-slate-700 dark:text-slate-200 mb-2">Company column</p>
          <p className="text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
            Text before → is the agency or payroll company. The chip is the <span className="font-medium text-slate-800 dark:text-slate-200">client</span> you are hiring for.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-2">
              <span className={cn(HR_CONSULTANCY_CLIENT_CHIP_CLASS, 'h-6 min-w-[4.5rem] shrink-0 items-center justify-center !py-0 text-[11px]')} aria-hidden>
                Client
              </span>
              <span>HR consultancy — client company</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className={cn(HR_THIRD_PARTY_CLIENT_CHIP_CLASS, 'h-6 min-w-[4.5rem] shrink-0 items-center justify-center !py-0 text-[11px]')} aria-hidden>
                Client
              </span>
              <span>Third-party payroll — client company</span>
            </span>
          </div>
        </div>)}

      {allContacts.length === 0 ? (<Card className="border-dashed border-slate-200 dark:border-slate-800">
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4"/>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No HR contacts yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Save company HR details here. When you schedule interviews, you can link one of these contacts.
            </p>
            <Button onClick={openCreate} variant="outline">
              <Plus className="h-4 w-4 mr-2"/>
              Add your first contact
            </Button>
          </CardContent>
        </Card>) : listTotal === 0 ? (
        <Card className="border-dashed border-slate-200 dark:border-slate-800">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">No contacts match your search or filters.</p>
          </CardContent>
        </Card>
      ) : listTotal > 0 ? (<div className="space-y-3">
          <div className="md:hidden flex flex-col gap-3">
            {hrContacts.map((row) => (<Card key={row._id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="min-w-0">{dataColumns[0].render(row)}</div>
                  {dataColumns.slice(1).map((col) => (<div key={col.title} className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{col.title}</p>
                      <div className="text-sm min-w-0 text-slate-800 dark:text-slate-200">{col.render(row)}</div>
                    </div>))}
                  <div className="flex justify-end gap-0.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="ghost" size="sm" className="h-9 w-9 touch-manipulation p-0 transition-none hover:bg-transparent dark:hover:bg-transparent" onClick={() => setViewing(row)} title="View details" type="button" aria-label="View details">
                      <Eye className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 touch-manipulation p-0 transition-none hover:bg-transparent dark:hover:bg-transparent" onClick={() => openEdit(row)} title="Edit" type="button">
                      <Pencil className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 touch-manipulation p-0 transition-none text-red-600 hover:bg-transparent hover:text-red-700 dark:text-red-400 dark:hover:bg-transparent dark:hover:text-red-300" onClick={() => setDeleteId(row._id)} title="Delete" type="button">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                </CardContent>
              </Card>))}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
              <colgroup>
                {HR_TABLE_COL_WIDTH_PERCENT.map((pct, i) => (<col key={i} style={{ width: `${pct}%` }}/>))}
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  {dataColumns.map((col) => (<th key={col.title} scope="col" className={HR_TH_BASE}>
                      <span className="block min-w-0">{col.title}</span>
                    </th>))}
                  <th scope="col" className={HR_ACTIONS_TH_CLASS}>
                    <span className="block min-w-0">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {hrContacts.map((row) => {
                    return (<tr key={row._id} className="group border-b border-slate-100 last:border-0 dark:border-slate-800">
                        {dataColumns.map((col) => (<td key={col.title} className={col.tdClass}>
                            {col.render(row)}
                          </td>))}
                        <td className={HR_ACTIONS_TD_CLASS}>
                          <div className="inline-flex items-center justify-center gap-0.5 leading-none">
                            <Button variant="ghost" size="sm" className="h-7 w-7 touch-manipulation p-0 transition-none hover:bg-transparent dark:hover:bg-transparent" onClick={() => setViewing(row)} title="View details" type="button" aria-label="View details">
                              <Eye className="h-3.5 w-3.5"/>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 touch-manipulation p-0 transition-none hover:bg-transparent dark:hover:bg-transparent" onClick={() => openEdit(row)} title="Edit" type="button">
                              <Pencil className="h-3.5 w-3.5"/>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 touch-manipulation p-0 transition-none text-red-600 hover:bg-transparent hover:text-red-700 dark:text-red-400 dark:hover:bg-transparent dark:hover:text-red-300" onClick={() => setDeleteId(row._id)} title="Delete" type="button">
                              <Trash2 className="h-3.5 w-3.5"/>
                            </Button>
                          </div>
                        </td>
                      </tr>);
                })}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/90 px-3 py-3 sm:px-4 dark:border-slate-700 dark:bg-slate-800/50 md:border-0 md:bg-transparent md:px-3 md:py-2 lg:px-4">
            <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-6">
              <p className="text-center text-xs leading-snug text-slate-600 dark:text-slate-400 sm:text-sm md:text-left md:leading-normal">
                Showing <span className="font-medium tabular-nums text-slate-800 dark:text-slate-200">{(page - 1) * pageSize + 1}</span>–<span className="font-medium tabular-nums text-slate-800 dark:text-slate-200">{Math.min(page * pageSize, listTotal ?? 0)}</span> of <span className="font-medium tabular-nums text-slate-800 dark:text-slate-200">{listTotal ?? 0}</span>
              </p>
              <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-4 md:justify-end md:gap-5">
                <div className="flex min-w-0 shrink items-center gap-2">
                  <Label htmlFor="hr-page-size" className="text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">
                    Per page
                  </Label>
                  <Select id="hr-page-size" value={String(pageSize)} onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (HR_CONTACTS_PAGE_SIZES.includes(v as HrContactsPageSize)) {
                    setPageSize(v as HrContactsPageSize);
                    setPage(1);
                }
            }} className="h-10 w-[4.25rem] min-h-10 shrink-0 px-2 py-1.5 text-sm sm:w-[4.75rem]">
                    {HR_CONTACTS_PAGE_SIZES.map((n) => (<option key={n} value={n}>
                        {n}
                      </option>))}
                  </Select>
                </div>
                <nav className="flex shrink-0 items-center gap-1 sm:gap-1.5" aria-label="Pagination">
                  <Button type="button" variant="outline" size="sm" className="h-10 w-10 min-h-10 min-w-10 p-0" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
                    <ChevronLeft className="h-4 w-4"/>
                  </Button>
                  <span className="min-w-[3.25rem] text-center text-xs tabular-nums font-medium text-slate-800 dark:text-slate-200 sm:min-w-[4.5rem] sm:text-sm">
                    {page} / {listTotalPages ?? 1}
                  </span>
                  <Button type="button" variant="outline" size="sm" className="h-10 w-10 min-h-10 min-w-10 p-0" disabled={listTotalPages !== undefined ? page >= listTotalPages : true} onClick={() => setPage((p) => Math.min(listTotalPages ?? 1, p + 1))} aria-label="Next page">
                    <ChevronRight className="h-4 w-4"/>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit HR contact' : 'Add HR contact'}</DialogTitle>
            <DialogDescription>
              All fields are optional, but at least one must be filled. Phone must be exactly 10 digits. The same phone number cannot be saved twice.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {formError && (<p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {formError}
              </p>)}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyType">Company Type</Label>
              <Select id="companyType" value={form.companyType ?? ''} onChange={(e) => {
            const v = e.target.value;
            setForm((f) => ({
                ...f,
                companyType: v === '' ? undefined : (v as HrCompanyType),
            }));
        }}>
                <option value="">Select Type (Optional)</option>
                {HR_COMPANY_TYPE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>))}
              </Select>
            </div>
            {form.companyType === 'consultancy' && (<>
                <div className="space-y-2">
                  <Label htmlFor="intermediaryCompanyName">HR Consultancy Name</Label>
                  <Input id="intermediaryCompanyName" value={form.intermediaryCompanyName} onChange={(e) => setForm((f) => ({ ...f, intermediaryCompanyName: e.target.value }))} placeholder="Agency or consultancy you deal with"/>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} placeholder="Client company they are hiring for"/>
                </div>
              </>)}
            {form.companyType === 'third_party_payroll' && (<>
                <div className="space-y-2">
                  <Label htmlFor="intermediaryCompanyNamePayroll">Third Party Company Name</Label>
                  <Input id="intermediaryCompanyNamePayroll" value={form.intermediaryCompanyName} onChange={(e) => setForm((f) => ({ ...f, intermediaryCompanyName: e.target.value }))} placeholder="Payroll or staffing company"/>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="companyNamePayroll">Client Name</Label>
                  <Input id="companyNamePayroll" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} placeholder="Where you work on paper / end client"/>
                </div>
              </>)}
            {form.companyType !== 'consultancy' && form.companyType !== 'third_party_payroll' && (<div className="space-y-2">
                <Label htmlFor="companyNameSimple">Company Name</Label>
                <Input id="companyNameSimple" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} placeholder="Acme Corp"/>
              </div>)}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="hrName">HR / Recruiter Name</Label>
                <Input id="hrName" value={form.hrName} onChange={(e) => setForm((f) => ({ ...f, hrName: e.target.value }))} placeholder="Jane Doe"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: normalizePhoneDigits(e.target.value).slice(0, 10) }))} placeholder="9876543210" inputMode="numeric" autoComplete="tel" maxLength={10}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="hr@company.com"/>
              </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="noticePeriodLwdNote" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-teal-600 dark:text-teal-400"/>
                Notice Period &amp; LWD (What you told this recruiter)
              </Label>
              <textarea id="noticePeriodLwdNote" value={form.noticePeriodLwdNote ?? ''} onChange={(e) => setForm((f) => ({ ...f, noticePeriodLwdNote: e.target.value }))} placeholder="e.g. Told them I’m on 2 months NP, LWD 15 May; or immediate joiner; or serving notice…" rows={4} maxLength={5000} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-y min-h-[96px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"/>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {(form.noticePeriodLwdNote ?? '').length}/5000
              </p>
            </div>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-3">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="shareable" className="text-sm font-medium">
                  Include in shared list
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  When your public link is enabled, only contacts with this on are visible.
                </p>
              </div>
              <button
                id="shareable"
                type="button"
                role="switch"
                aria-checked={form.shareable ?? false}
                onClick={() => setForm((f) => ({ ...f, shareable: !(f.shareable ?? false) }))}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40',
                  form.shareable ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                    form.shareable ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
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

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent onClose={() => setViewing(null)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>HR contact details</DialogTitle>
            {viewing && (<div className="text-sm text-muted-foreground pt-0.5">
                <HrContactCompanyChips row={viewing} showBuildingIcon={false}/>
              </div>)}
          </DialogHeader>
          {viewing && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-2 text-sm">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Company type</p>
                <div>
                  {viewing.companyType ? (<span className={HR_COMPANY_TYPE_BADGE_CLASS[viewing.companyType]}>
                      {HR_COMPANY_TYPE_SHORT_LABEL[viewing.companyType]}
                    </span>) : (<span className="text-slate-500 dark:text-slate-400">—</span>)}
                  {viewing.companyType && (<span className="sr-only">{HR_COMPANY_TYPE_LABELS[viewing.companyType]}</span>)}
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">HR / recruiter name</p>
                <p className="text-slate-900 dark:text-slate-100">{viewing.hrName?.trim() || '—'}</p>
              </div>
              {viewing.companyType === 'consultancy' && (<>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">HR consultancy name</p>
                    <p>
                      <span className={HR_INTERMEDIARY_PLAIN_TEXT_CLASS}>
                        {viewing.intermediaryCompanyName?.trim() || '—'}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Client company</p>
                    <p>
                      <span className={HR_CONSULTANCY_CLIENT_CHIP_CLASS}>
                        {viewing.companyName?.trim() || '—'}
                      </span>
                    </p>
                  </div>
                </>)}
              {viewing.companyType === 'third_party_payroll' && (<>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Third-party company</p>
                    <p>
                      <span className={HR_INTERMEDIARY_PLAIN_TEXT_CLASS}>
                        {viewing.intermediaryCompanyName?.trim() || '—'}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Client name</p>
                    <p>
                      <span className={HR_THIRD_PARTY_CLIENT_CHIP_CLASS}>
                        {viewing.companyName?.trim() || '—'}
                      </span>
                    </p>
                  </div>
                </>)}
              {viewing.companyType !== 'consultancy' && viewing.companyType !== 'third_party_payroll' && (<div className="space-y-1 min-w-0 sm:col-span-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Company name</p>
                  <p>
                    {viewing.companyType ? (<span className={HR_COMPANY_NAME_CHIP_CLASS[viewing.companyType]}>
                        {viewing.companyName?.trim() || '—'}
                      </span>) : (<span className="text-slate-900 dark:text-slate-100 break-words">
                        {viewing.companyName?.trim() || '—'}
                      </span>)}
                  </p>
                </div>)}
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</p>
                {(() => {
                    const line = viewing.phone?.trim() || '';
                    const href = telHrefFromPhone(viewing.phone);
                    if (!line)
                        return <p className="text-slate-900 dark:text-slate-100">—</p>;
                    if (!href)
                        return <p className="text-slate-900 dark:text-slate-100 tabular-nums">{line}</p>;
                    return (<a href={href} className="inline-flex text-teal-600 font-medium tabular-nums underline decoration-teal-600/40 underline-offset-2 hover:decoration-teal-600 dark:text-teal-400 py-1 -my-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40" aria-label={`Call ${line}`}>
                        {line}
                      </a>);
                })()}
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</p>
                {(() => {
                    const line = viewing.email?.trim() || '';
                    const href = mailtoHrefFromEmail(viewing.email);
                    if (!line)
                        return <p className="text-slate-900 dark:text-slate-100">—</p>;
                    if (!href)
                        return <p className="text-slate-900 dark:text-slate-100 break-all">{line}</p>;
                    return (<a href={href} className="inline-flex text-teal-600 font-medium break-all underline decoration-teal-600/40 underline-offset-2 hover:decoration-teal-600 dark:text-teal-400 py-1 -my-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40" aria-label={`Email ${line}`}>
                        {line}
                      </a>);
                })()}
              </div>
              <div className="space-y-1 min-w-0 sm:col-span-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <StickyNote className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0"/>
                  Notice period &amp; LWD
                </p>
                {viewing.noticePeriodLwdNote?.trim() ? (<p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
                    {viewing.noticePeriodLwdNote}
                  </p>) : (<p className="text-slate-400 dark:text-slate-500">—</p>)}
              </div>
            </div>)}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setViewing(null)}>
              Close
            </Button>
            {viewing && (<Button type="button" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => {
                const row = viewing;
                setViewing(null);
                openEdit(row);
            }}>
                Edit
              </Button>)}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent onClose={() => setShareDialogOpen(false)} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share HR contacts</DialogTitle>
            <DialogDescription>
              Anyone with the link can view contacts marked as shareable, without signing in. You can disable the link anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {isShareLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : share.enabled ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="share-url">Public link</Label>
                  <div className="flex gap-2">
                    <Input id="share-url" readOnly value={share.shareUrl} className="font-mono text-xs sm:text-sm" />
                    <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => copyShareUrl(share.shareUrl)} aria-label="Copy link">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2">
                  Only contacts with &quot;Include in shared list&quot; enabled are visible. Phone numbers and emails are shown to anyone with the link.
                </p>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShareDialogOpen(false)}>
                    Close
                  </Button>
                  <Button type="button" variant="destructive" disabled={isRevoking} onClick={async () => {
                    await revokeShare();
                  }}>
                    <Link2Off className="h-4 w-4 mr-2" />
                    {isRevoking ? 'Disabling…' : 'Disable link'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Create a public link to share contacts you have marked as shareable.
                </p>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShareDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={isEnabling} onClick={async () => {
                    await enableShare();
                  }}>
                    <Share2 className="h-4 w-4 mr-2" />
                    {isEnabling ? 'Creating…' : 'Create public link'}
                  </Button>
                </div>
              </>
            )}
          </div>
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
    </div>);
}
