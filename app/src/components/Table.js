export default function Table ({
  tableHeaders,
  tableData,
  currentPage,
  totalPages,
  isFirstPage,
  isFetching,
  isLastPage,
  prevPageHandler,
  nextPageHandler
}) {
  return (
    <table className='w-full border-collapse'>
      <thead>
        <tr className='text-left bg-gray-200'>{tableHeaders}</tr>
      </thead>
      <tbody>
        {tableData}
        <tr>
          <td colSpan={6} className='py-6 px-6 text-right'>
            <button
              onClick={prevPageHandler}
              disabled={isFirstPage}
              className='px-4 py-2 bg-gray-300 rounded disabled:opacity-50'
            >
              Previous
            </button>
            <span className='mx-4'>
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={nextPageHandler}
              disabled={isLastPage}
              className='px-4 py-2 bg-gray-300 rounded disabled:opacity-50'
            >
              Next
            </button>
            {isFetching && <span className='ml-4'>Loading...</span>}
          </td>
        </tr>
      </tbody>
    </table>
  )
}
