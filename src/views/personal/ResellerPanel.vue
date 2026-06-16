<template>
  <div class="space-y-6">
    <div class="theme-personal-card">
      <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl font-bold theme-text-primary">{{ t('personalCenter.reseller.title') }}</h2>
          <p class="mt-1 text-sm theme-text-muted">{{ t('personalCenter.reseller.subtitle') }}</p>
        </div>
        <span class="theme-badge theme-badge-accent px-3 py-1 text-xs font-semibold">
          {{ t('personalCenter.tabs.reseller') }}
        </span>
      </div>

      <div v-if="panelAlert" class="mb-5 rounded-xl border px-4 py-3 text-sm shadow-sm" :class="pageAlertClass(panelAlert.level)">
        {{ panelAlert.message }}
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="idx in 3" :key="idx" class="h-16 animate-pulse rounded-xl border theme-surface-muted"></div>
      </div>

      <template v-else-if="dashboard?.opened">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="rounded-xl border theme-surface-soft p-4">
            <div class="text-xs theme-text-muted">{{ t('personalCenter.reseller.primaryAvailable') }}</div>
            <div class="mt-2 text-lg font-bold theme-text-primary">{{ primaryBalanceText }}</div>
          </div>
          <div class="rounded-xl border theme-surface-soft p-4">
            <div class="text-xs theme-text-muted">{{ t('personalCenter.reseller.currencyCount') }}</div>
            <div class="mt-2 text-lg font-bold theme-text-primary">{{ balances.length }}</div>
          </div>
          <div class="rounded-xl border theme-surface-soft p-4">
            <div class="text-xs theme-text-muted">{{ t('personalCenter.reseller.settlementStatus') }}</div>
            <div class="mt-2">
              <span class="theme-badge px-2.5 py-1 text-xs font-semibold" :class="profileStatusClass">
                {{ profileStatusText }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-5">
          <div class="mb-3 flex items-center justify-between gap-3">
            <h3 class="text-base font-bold theme-text-primary">{{ t('personalCenter.reseller.balanceTitle') }}</h3>
            <button
              type="button"
              class="inline-flex items-center rounded-lg border theme-btn-secondary px-3 py-1.5 text-xs font-semibold"
              @click="initialize"
            >
              {{ t('orders.filters.refresh') }}
            </button>
          </div>
          <div v-if="balances.length === 0" class="rounded-xl border border-dashed theme-surface-soft px-4 py-6 text-sm theme-text-muted">
            {{ t('personalCenter.reseller.balanceEmpty') }}
          </div>
          <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div v-for="item in balances" :key="item.id" class="rounded-xl border theme-surface-soft p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="font-mono text-sm font-bold theme-text-primary">{{ item.currency }}</div>
                  <div class="mt-2 text-xs theme-text-muted">{{ t('personalCenter.reseller.availableAmount') }}</div>
                  <div class="mt-1 font-mono text-base font-semibold theme-text-primary">{{ item.available_amount }}</div>
                </div>
                <span class="theme-badge px-2.5 py-1 text-xs font-semibold" :class="balanceStatusClass(item.status)">
                  {{ balanceStatusLabel(item.status) }}
                </span>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div class="theme-text-muted">{{ t('personalCenter.reseller.lockedAmount') }}</div>
                  <div class="mt-1 font-mono theme-text-secondary">{{ item.locked_amount }}</div>
                </div>
                <div>
                  <div class="theme-text-muted">{{ t('personalCenter.reseller.negativeAmount') }}</div>
                  <div class="mt-1 font-mono theme-text-secondary">{{ item.negative_amount }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="rounded-xl border border-dashed theme-surface-soft p-5">
        <p class="text-sm theme-text-muted">{{ t('personalCenter.reseller.notOpened') }}</p>
      </div>
    </div>

    <div v-if="dashboard?.opened" class="theme-personal-card">
      <h3 class="text-lg font-bold theme-text-primary">{{ t('personalCenter.reseller.withdrawTitle') }}</h3>
      <p class="mt-1 text-sm theme-text-muted">{{ t('personalCenter.reseller.withdrawSubtitle') }}</p>
      <div
        v-if="!withdrawEnabled"
        class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200"
      >
        {{ withdrawDisabledReasonText }}
      </div>
      <form class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-5" @submit.prevent="handleApplyWithdraw">
        <div>
          <label class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.withdrawAmountLabel') }}</label>
          <input
            v-model.trim="withdrawForm.amount"
            type="text"
            inputmode="decimal"
            class="w-full form-input-lg"
            :disabled="!withdrawEnabled || submittingWithdraw"
            :placeholder="t('personalCenter.reseller.withdrawAmountPlaceholder')"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.withdrawCurrencyLabel') }}</label>
          <select
            v-if="balanceCurrencies.length > 0"
            v-model="withdrawForm.currency"
            class="w-full form-input-lg"
            :disabled="!withdrawEnabled || submittingWithdraw"
          >
            <option value="">{{ t('personalCenter.reseller.withdrawCurrencyPlaceholder') }}</option>
            <option v-for="currency in balanceCurrencies" :key="currency" :value="currency">{{ currency }}</option>
          </select>
          <input
            v-else
            v-model.trim="withdrawForm.currency"
            type="text"
            class="w-full form-input-lg"
            :disabled="!withdrawEnabled || submittingWithdraw"
            :placeholder="t('personalCenter.reseller.withdrawCurrencyPlaceholder')"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.withdrawChannelLabel') }}</label>
          <input
            v-model.trim="withdrawForm.channel"
            type="text"
            class="w-full form-input-lg"
            :disabled="!withdrawEnabled || submittingWithdraw"
            :placeholder="t('personalCenter.reseller.withdrawChannelPlaceholder')"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.withdrawAccountLabel') }}</label>
          <input
            v-model.trim="withdrawForm.account"
            type="text"
            class="w-full form-input-lg"
            :disabled="!withdrawEnabled || submittingWithdraw"
            :placeholder="t('personalCenter.reseller.withdrawAccountPlaceholder')"
          />
        </div>
        <div class="flex items-end">
          <button
            type="submit"
            :disabled="submittingWithdraw || !withdrawEnabled"
            class="inline-flex h-11 w-full items-center justify-center rounded-xl theme-btn-primary px-5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ submittingWithdraw ? t('personalCenter.reseller.withdrawing') : t('personalCenter.reseller.withdrawSubmit') }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="dashboard?.opened" class="theme-personal-card">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-bold theme-text-primary">{{ t('personalCenter.reseller.ledgerTitle') }}</h3>
        <button
          type="button"
          class="inline-flex items-center rounded-lg border theme-btn-secondary px-3 py-1.5 text-xs font-semibold"
          @click="loadLedgerEntries(ledgerPagination.page)"
        >
          {{ t('orders.filters.refresh') }}
        </button>
      </div>

      <div v-if="ledgerLoading" class="space-y-3">
        <div v-for="idx in 3" :key="idx" class="h-14 animate-pulse rounded-xl border theme-surface-muted"></div>
      </div>
      <div v-else-if="ledgerEntries.length === 0" class="rounded-xl border border-dashed theme-surface-soft px-4 py-6 text-sm theme-text-muted">
        {{ t('personalCenter.reseller.ledgerEmpty') }}
      </div>
      <div v-else class="overflow-x-auto rounded-xl border border-gray-200/70 dark:border-white/10">
        <table class="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-white/10">
          <thead class="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.reseller.ledgerTable.type') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.reseller.ledgerTable.amount') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.reseller.ledgerTable.status') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.reseller.ledgerTable.availableAt') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.reseller.ledgerTable.createdAt') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-white/10">
            <tr v-for="item in ledgerEntries" :key="item.id">
              <td class="px-4 py-3 text-xs theme-text-secondary">{{ ledgerTypeLabel(item.type) }}</td>
              <td class="px-4 py-3 font-mono text-xs theme-text-primary">{{ item.amount }} {{ item.currency }}</td>
              <td class="px-4 py-3 text-xs">
                <span class="theme-badge px-2.5 py-1 text-xs font-semibold" :class="ledgerStatusClass(item.status)">
                  {{ ledgerStatusLabel(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs theme-text-muted">{{ formatDate(item.available_at) }}</td>
              <td class="px-4 py-3 text-xs theme-text-muted">{{ formatDate(item.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="ledgerPagination.total_page > 1" class="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          :disabled="ledgerPagination.page <= 1"
          class="rounded-lg border theme-btn-secondary px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          @click="loadLedgerEntries(ledgerPagination.page - 1)"
        >
          {{ t('orders.prevPage') }}
        </button>
        <span class="rounded-full border theme-pill-neutral px-4 py-2 text-sm">
          {{ t('orders.pageInfo', { page: ledgerPagination.page, total: ledgerPagination.total_page }) }}
        </span>
        <button
          :disabled="ledgerPagination.page >= ledgerPagination.total_page"
          class="rounded-lg border theme-btn-secondary px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          @click="loadLedgerEntries(ledgerPagination.page + 1)"
        >
          {{ t('orders.nextPage') }}
        </button>
      </div>
    </div>

    <div v-if="dashboard?.opened" class="theme-personal-card">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-bold theme-text-primary">{{ t('personalCenter.reseller.withdrawRecordTitle') }}</h3>
        <button
          type="button"
          class="inline-flex items-center rounded-lg border theme-btn-secondary px-3 py-1.5 text-xs font-semibold"
          @click="loadWithdraws(withdrawsPagination.page)"
        >
          {{ t('orders.filters.refresh') }}
        </button>
      </div>

      <div v-if="withdrawsLoading" class="space-y-3">
        <div v-for="idx in 3" :key="idx" class="h-14 animate-pulse rounded-xl border theme-surface-muted"></div>
      </div>
      <div v-else-if="withdraws.length === 0" class="rounded-xl border border-dashed theme-surface-soft px-4 py-6 text-sm theme-text-muted">
        {{ t('personalCenter.reseller.withdrawEmpty') }}
      </div>
      <div v-else class="overflow-x-auto rounded-xl border border-gray-200/70 dark:border-white/10">
        <table class="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-white/10">
          <thead class="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.reseller.withdrawTable.amount') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.reseller.withdrawTable.channel') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.reseller.withdrawTable.status') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.reseller.withdrawTable.createdAt') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.reseller.withdrawTable.processedAt') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-white/10">
            <tr v-for="item in withdraws" :key="item.id">
              <td class="px-4 py-3 font-mono text-xs theme-text-primary">{{ item.amount }} {{ item.currency }}</td>
              <td class="px-4 py-3 text-xs theme-text-secondary">{{ item.channel }}</td>
              <td class="px-4 py-3 text-xs">
                <span class="theme-badge px-2.5 py-1 text-xs font-semibold" :class="withdrawStatusClass(item.status)">
                  {{ withdrawStatusLabel(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs theme-text-muted">{{ formatDate(item.created_at) }}</td>
              <td class="px-4 py-3 text-xs theme-text-muted">{{ formatDate(item.processed_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="withdrawsPagination.total_page > 1" class="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          :disabled="withdrawsPagination.page <= 1"
          class="rounded-lg border theme-btn-secondary px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          @click="loadWithdraws(withdrawsPagination.page - 1)"
        >
          {{ t('orders.prevPage') }}
        </button>
        <span class="rounded-full border theme-pill-neutral px-4 py-2 text-sm">
          {{ t('orders.pageInfo', { page: withdrawsPagination.page, total: withdrawsPagination.total_page }) }}
        </span>
        <button
          :disabled="withdrawsPagination.page >= withdrawsPagination.total_page"
          class="rounded-lg border theme-btn-secondary px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          @click="loadWithdraws(withdrawsPagination.page + 1)"
        >
          {{ t('orders.nextPage') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { resellerAPI, type ResellerDashboardData, type ResellerLedgerData, type ResellerWithdrawData } from '../../api'
import {
  RESELLER_BALANCE_STATUS_DISABLED,
  RESELLER_BALANCE_STATUS_FROZEN_REVIEW,
  RESELLER_BALANCE_STATUS_NEGATIVE_BALANCE,
  RESELLER_BALANCE_STATUS_NORMAL,
  RESELLER_LEDGER_STATUS_AVAILABLE,
  RESELLER_LEDGER_STATUS_CANCELED,
  RESELLER_LEDGER_STATUS_LOCKED,
  RESELLER_LEDGER_STATUS_PENDING_CONFIRM,
  RESELLER_LEDGER_STATUS_WITHDRAWN,
  RESELLER_WITHDRAW_STATUS_PAID,
  RESELLER_WITHDRAW_STATUS_PENDING,
  RESELLER_WITHDRAW_STATUS_REJECTED,
} from '../../constants/reseller'
import { pageAlertClass, type PageAlert } from '../../utils/alerts'
import {
  getResellerFinanceStatusView,
  getResellerLedgerTypeKey,
  getResellerWithdrawDisabledReasonKey,
  isResellerWithdrawEnabled,
} from '../../utils/resellerFinance'

const { t } = useI18n()

const loading = ref(true)
const ledgerLoading = ref(false)
const withdrawsLoading = ref(false)
const submittingWithdraw = ref(false)
const dashboard = ref<ResellerDashboardData | null>(null)
const panelAlert = ref<PageAlert | null>(null)

const ledgerEntries = ref<ResellerLedgerData[]>([])
const withdraws = ref<ResellerWithdrawData[]>([])

const ledgerPagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
  total_page: 1,
})

const withdrawsPagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
  total_page: 1,
})

const withdrawForm = reactive({
  amount: '',
  currency: '',
  channel: '',
  account: '',
})

const balances = computed(() => dashboard.value?.balances || [])

const balanceCurrencies = computed(() => {
  const values = balances.value.map((item) => item.currency).filter(Boolean)
  return Array.from(new Set(values))
})

const primaryBalanceText = computed(() => {
  const first = balances.value[0]
  if (!first) return '-'
  return `${first.available_amount} ${first.currency}`
})

const withdrawEnabled = computed(() => isResellerWithdrawEnabled(dashboard.value))

const withdrawDisabledReasonText = computed(() => {
  const key = getResellerWithdrawDisabledReasonKey(dashboard.value?.withdraw_disabled_reason)
  return t(`personalCenter.reseller.withdrawDisabledReason.${key}`)
})

const profileStatusView = computed(() => getResellerFinanceStatusView(dashboard.value?.profile))

const profileStatusText = computed(() => {
  const view = profileStatusView.value
  return t(`personalCenter.reseller.${view.namespace}.${view.key}`)
})

const profileStatusClass = computed(() => profileStatusView.value.badgeClass)

const ensureWithdrawCurrency = () => {
  if (withdrawForm.currency || balanceCurrencies.value.length === 0) return
  const firstCurrency = balanceCurrencies.value[0]
  if (firstCurrency) {
    withdrawForm.currency = firstCurrency
  }
}

const formatDate = (raw?: string) => {
  if (!raw) return '-'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString()
}

const loadDashboard = async () => {
  const response = await resellerAPI.dashboard()
  dashboard.value = response.data.data || null
  ensureWithdrawCurrency()
}

const loadLedgerEntries = async (page = 1) => {
  ledgerLoading.value = true
  try {
    const response = await resellerAPI.ledgerEntries({
      page,
      page_size: ledgerPagination.page_size,
    })
    ledgerEntries.value = response.data.data || []
    Object.assign(ledgerPagination, response.data.pagination || ledgerPagination)
  } catch {
    ledgerEntries.value = []
  } finally {
    ledgerLoading.value = false
  }
}

const loadWithdraws = async (page = 1) => {
  withdrawsLoading.value = true
  try {
    const response = await resellerAPI.withdraws({
      page,
      page_size: withdrawsPagination.page_size,
    })
    withdraws.value = response.data.data || []
    Object.assign(withdrawsPagination, response.data.pagination || withdrawsPagination)
  } catch {
    withdraws.value = []
  } finally {
    withdrawsLoading.value = false
  }
}

const reloadOpenedData = async () => {
  if (!dashboard.value?.opened) return
  await Promise.all([loadLedgerEntries(1), loadWithdraws(1)])
}

const initialize = async () => {
  loading.value = true
  panelAlert.value = null
  try {
    await loadDashboard()
    await reloadOpenedData()
  } catch (err: any) {
    dashboard.value = null
    panelAlert.value = {
      level: 'error',
      message: err?.message || t('personalCenter.reseller.errors.loadFailed'),
    }
  } finally {
    loading.value = false
  }
}

const handleApplyWithdraw = async () => {
  panelAlert.value = null
  if (!withdrawEnabled.value) {
    panelAlert.value = {
      level: 'warning',
      message: withdrawDisabledReasonText.value,
    }
    return
  }
  if (!withdrawForm.amount.trim()) {
    panelAlert.value = {
      level: 'warning',
      message: t('personalCenter.reseller.errors.withdrawAmountRequired'),
    }
    return
  }
  if (!withdrawForm.currency.trim()) {
    panelAlert.value = {
      level: 'warning',
      message: t('personalCenter.reseller.errors.withdrawCurrencyRequired'),
    }
    return
  }
  if (!withdrawForm.channel.trim()) {
    panelAlert.value = {
      level: 'warning',
      message: t('personalCenter.reseller.errors.withdrawChannelRequired'),
    }
    return
  }
  if (!withdrawForm.account.trim()) {
    panelAlert.value = {
      level: 'warning',
      message: t('personalCenter.reseller.errors.withdrawAccountRequired'),
    }
    return
  }

  submittingWithdraw.value = true
  try {
    await resellerAPI.applyWithdraw({
      amount: withdrawForm.amount.trim(),
      currency: withdrawForm.currency.trim(),
      channel: withdrawForm.channel.trim(),
      account: withdrawForm.account.trim(),
    })
    withdrawForm.amount = ''
    withdrawForm.account = ''
    panelAlert.value = {
      level: 'success',
      message: t('personalCenter.reseller.withdrawSuccess'),
    }
    await Promise.all([loadDashboard(), loadLedgerEntries(1), loadWithdraws(1)])
  } catch (err: any) {
    panelAlert.value = {
      level: 'error',
      message: err?.message || t('personalCenter.reseller.errors.withdrawFailed'),
    }
  } finally {
    submittingWithdraw.value = false
  }
}

const balanceStatusLabel = (status?: string) => {
  if (status === RESELLER_BALANCE_STATUS_NORMAL) return t('personalCenter.reseller.balanceStatus.normal')
  if (status === RESELLER_BALANCE_STATUS_NEGATIVE_BALANCE) return t('personalCenter.reseller.balanceStatus.negativeBalance')
  if (status === RESELLER_BALANCE_STATUS_FROZEN_REVIEW) return t('personalCenter.reseller.balanceStatus.frozenReview')
  if (status === RESELLER_BALANCE_STATUS_DISABLED) return t('personalCenter.reseller.balanceStatus.disabled')
  return status || '-'
}

const balanceStatusClass = (status?: string) => {
  if (status === RESELLER_BALANCE_STATUS_NORMAL) return 'theme-badge-success'
  if (status === RESELLER_BALANCE_STATUS_NEGATIVE_BALANCE) return 'theme-badge-warning'
  if (status === RESELLER_BALANCE_STATUS_FROZEN_REVIEW) return 'theme-badge-warning'
  if (status === RESELLER_BALANCE_STATUS_DISABLED) return 'theme-badge-neutral'
  return 'theme-badge-neutral'
}

const ledgerTypeLabel = (type?: string) => {
  const key = getResellerLedgerTypeKey(type)
  if (key) return t(`personalCenter.reseller.ledgerType.${key}`)
  return type || '-'
}

const ledgerStatusLabel = (status?: string) => {
  if (status === RESELLER_LEDGER_STATUS_PENDING_CONFIRM) return t('personalCenter.reseller.ledgerStatus.pendingConfirm')
  if (status === RESELLER_LEDGER_STATUS_AVAILABLE) return t('personalCenter.reseller.ledgerStatus.available')
  if (status === RESELLER_LEDGER_STATUS_LOCKED) return t('personalCenter.reseller.ledgerStatus.locked')
  if (status === RESELLER_LEDGER_STATUS_WITHDRAWN) return t('personalCenter.reseller.ledgerStatus.withdrawn')
  if (status === RESELLER_LEDGER_STATUS_CANCELED) return t('personalCenter.reseller.ledgerStatus.canceled')
  return status || '-'
}

const ledgerStatusClass = (status?: string) => {
  if (status === RESELLER_LEDGER_STATUS_PENDING_CONFIRM) return 'theme-badge-warning'
  if (status === RESELLER_LEDGER_STATUS_AVAILABLE) return 'theme-badge-success'
  if (status === RESELLER_LEDGER_STATUS_LOCKED) return 'theme-badge-info'
  if (status === RESELLER_LEDGER_STATUS_WITHDRAWN) return 'theme-badge-neutral'
  if (status === RESELLER_LEDGER_STATUS_CANCELED) return 'theme-badge-neutral'
  return 'theme-badge-neutral'
}

const withdrawStatusLabel = (status?: string) => {
  if (status === RESELLER_WITHDRAW_STATUS_PENDING) return t('personalCenter.reseller.withdrawStatus.pending')
  if (status === RESELLER_WITHDRAW_STATUS_REJECTED) return t('personalCenter.reseller.withdrawStatus.rejected')
  if (status === RESELLER_WITHDRAW_STATUS_PAID) return t('personalCenter.reseller.withdrawStatus.paid')
  return status || '-'
}

const withdrawStatusClass = (status?: string) => {
  if (status === RESELLER_WITHDRAW_STATUS_PENDING) return 'theme-badge-warning'
  if (status === RESELLER_WITHDRAW_STATUS_REJECTED) return 'theme-badge-neutral'
  if (status === RESELLER_WITHDRAW_STATUS_PAID) return 'theme-badge-success'
  return 'theme-badge-neutral'
}

onMounted(() => {
  initialize()
})
</script>
