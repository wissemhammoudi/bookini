import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUserProfile, getWorkspaceAuditLogs, listAuditLogs } from '@/lib/api'

export type AuditLogRecord = Awaited<ReturnType<typeof getWorkspaceAuditLogs>>[number]

const PAGE_SIZE = 10

const inferTypeFromAction = (action: string): AuditLogRecord['type'] => {
  const value = action.toLowerCase()
  if (value.includes('reservation') || value.includes('booking')) return 'reservation'
  if (value.includes('organization') || value.includes('org')) return 'organization'
  if (value.includes('partnership') || value.includes('partner')) return 'partnership'
  if (value.includes('contact') || value.includes('support')) return 'contact'
  return 'user'
}

const normalizeWorkspaceLogs = (
  logs: Awaited<ReturnType<typeof getWorkspaceAuditLogs>>,
): AuditLogRecord[] => {
  return logs.map((log) => ({
    id: log.id,
    title: log.title,
    description: log.description,
    timestamp: log.timestamp,
    type: log.type,
    ip_address: log.ip_address,
  }))
}

const normalizeSuperAdminLogs = (
  logs: Awaited<ReturnType<typeof listAuditLogs>>,
): AuditLogRecord[] => {
  return logs.map((log) => {
    const actionLabel = String(log.action || 'UNKNOWN_ACTION').replace(/_/g, ' ').toUpperCase()
    const actor = log.user_id ? `User ${log.user_id}` : 'Unknown user'
    return {
      id: log.id,
      title: actionLabel,
      description: `${actor} triggered ${actionLabel.toLowerCase()}.`,
      timestamp: log.timestamp,
      type: inferTypeFromAction(String(log.action || '')),
      ip_address: log.ip_address,
    }
  })
}

export function useLogsSectionState() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [ipSearch, setIpSearch] = useState('')
  const [page, setPage] = useState(0)

  const logsQuery = useQuery({
    queryKey: ['workspace-audit-logs'],
    queryFn: async () => {
      const currentUser = await getCurrentUserProfile()

      try {
        const workspaceLogs = await getWorkspaceAuditLogs()
        return normalizeWorkspaceLogs(workspaceLogs)
      } catch (workspaceError) {
        if (currentUser.role === 'SUPER_ADMIN') {
          const platformLogs = await listAuditLogs(200)
          return normalizeSuperAdminLogs(platformLogs)
        }
        throw workspaceError
      }
    },
    refetchInterval: 5000,
  })

  const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !search.trim() ||
        [log.title, log.description].some((val) =>
          val.toLowerCase().includes(search.trim().toLowerCase()),
        )

      const matchesType = typeFilter === 'ALL' || log.type === typeFilter.toLowerCase()

      const matchesIp =
        !ipSearch.trim() ||
        (log.ip_address && log.ip_address.toLowerCase().includes(ipSearch.trim().toLowerCase()))

      return matchesSearch && matchesType && matchesIp
    })
  }, [logs, search, typeFilter, ipSearch])

  const paginatedLogs = useMemo(() => {
    const start = page * PAGE_SIZE
    return filteredLogs.slice(start, start + PAGE_SIZE)
  }, [filteredLogs, page])

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE)

  return {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    ipSearch,
    setIpSearch,
    page,
    setPage,
    logsQuery,
    filteredLogs,
    paginatedLogs,
    totalPages,
    pageSize: PAGE_SIZE,
  }
}
