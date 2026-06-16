import { userApi } from './client'
import type { ResellerApplyPayload, ResellerCustomDomainPayload, ResellerWithdrawApplyPayload } from './types'

export const resellerAPI = {
    managementProfile: () => userApi.get('/reseller/profile'),
    apply: (data: ResellerApplyPayload) => userApi.post('/reseller/apply', data),
    domains: () => userApi.get('/reseller/domains'),
    submitDomain: (data: ResellerCustomDomainPayload) => userApi.post('/reseller/domains', data),
    dashboard: () => userApi.get('/reseller/dashboard'),
    balanceAccounts: (params?: any) => userApi.get('/reseller/balance-accounts', { params }),
    ledgerEntries: (params?: any) => userApi.get('/reseller/ledger-entries', { params }),
    withdraws: (params?: any) => userApi.get('/reseller/withdraws', { params }),
    applyWithdraw: (data: ResellerWithdrawApplyPayload) =>
        userApi.post('/reseller/withdraws', data),
}
