import { Alert, Stack } from '@mui/material'

import { LoadingState, SectionHeader } from '@/features/admin-workspace/admin-workspace-utils'
import { LogsFilters } from '@/features/admin-workspace/sections/logs/logs-filters'
import { LogsPagination } from '@/features/admin-workspace/sections/logs/logs-pagination'
import { LogsTable } from '@/features/admin-workspace/sections/logs/logs-table'
import { useLogsSectionState } from '@/features/admin-workspace/sections/logs/use-logs-section-state'

export const LogsSection = () => {
  const {
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
    pageSize,
  } = useLogsSectionState()

  if (logsQuery.isLoading) {
    return <LoadingState />
  }

  if (logsQuery.isError) {
    return <Alert severity="error">Could not load audit logs from the platform.</Alert>
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Audit Logs"
        description="Search, filter, and review all security, user lifecycle, and reservation events recorded on the platform."
      />

      <LogsFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        ipSearch={ipSearch}
        onIpSearchChange={(value) => {
          setIpSearch(value)
          setPage(0)
        }}
        typeFilter={typeFilter}
        onTypeFilterChange={(value) => {
          setTypeFilter(value)
          setPage(0)
        }}
        totalFiltered={filteredLogs.length}
      />

      <LogsTable logs={paginatedLogs} />

      {filteredLogs.length > pageSize ? (
        <LogsPagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((prev) => prev - 1)}
          onNext={() => setPage((prev) => prev + 1)}
        />
      ) : null}
    </Stack>
  )
}
