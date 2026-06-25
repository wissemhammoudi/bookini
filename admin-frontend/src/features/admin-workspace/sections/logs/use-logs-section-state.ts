import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getWorkspaceAuditLogs } from '@/lib/api'

export type AuditLogRecord = Awaited<ReturnType<typeof getWorkspaceAuditLogs>>[number]

const PAGE_SIZE = 10

export function useLogsSectionState() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [ipSearch, setIpSearch] = useState('')
  const [page, setPage] = useState(0)

  const logsQuery = useQuery({
    queryKey: ['workspace-audit-logs'],
    queryFn: getWorkspaceAuditLogs,
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
