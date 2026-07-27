import { HrContactRecord } from '../types';

export function filterHrDirectoryContacts(contacts: HrContactRecord[], query: string): HrContactRecord[] {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
        const hay = `${c.companyName ?? ''} ${c.intermediaryCompanyName ?? ''} ${c.hrName} ${c.phone} ${c.email ?? ''}`.toLowerCase();
        return hay.includes(q);
    });
}

export function filterHrContactsList(
    contacts: HrContactRecord[],
    query: string,
    companyType?: string,
    shareableFilter?: 'all' | 'shareable' | 'private',
): HrContactRecord[] {
    let result = filterHrDirectoryContacts(contacts, query);
    if (companyType && companyType !== 'all') {
        result = result.filter((c) => c.companyType === companyType);
    }
    if (shareableFilter === 'shareable') {
        result = result.filter((c) => c.shareable === true);
    }
    else if (shareableFilter === 'private') {
        result = result.filter((c) => !c.shareable);
    }
    return result;
}
