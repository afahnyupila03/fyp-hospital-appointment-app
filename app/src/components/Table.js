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
    <table className='w-full border-collapse border border-gray-300'>
      <thead className='bg-gray-200'>
        <tr className='text-left text-sm font-medium text-gray-700'>
          {tableHeaders}
        </tr>
      </thead>
      <tbody>
        {tableData}

        {totalPages > 0 && (
          <tr>
            <td
              colSpan={6}
              className='py-6 px-6 text-right border-t border-gray-300'
            >
              <button
                onClick={prevPageHandler}
                disabled={isFirstPage}
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300'
              >
                Previous
              </button>
              <span className='mx-4 text-sm text-gray-600'>
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={nextPageHandler}
                disabled={isLastPage}
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300'
              >
                Next
              </button>
              {isFetching && (
                <span className='ml-4 text-sm text-gray-500'>Loading...</span>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
