import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import Link from 'next/link'

export default function Dropdown ({ actions, actionHandler }) {
  return (
    <Menu as='div' className='relative inline-block text-left'>
      <div>
        <MenuButton className='inline-flex items-center justify-center rounded-md bg-gray-100 p-2 hover:bg-gray-200 transition duration-200'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-6 w-6 text-gray-700'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z'
            />
          </svg>
        </MenuButton>
      </div>

      <MenuItems className='absolute left-1/2 z-20 mt-2 w-40 -translate-x-1/2 origin-top rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none divide-y divide-gray-100'>
        {actions.map((action, index) => (
          <MenuItem key={index}>
            {({ active }) => {
              const href =
                action.type === 'link'
                  ? {
                      pathname: action.link,
                      ...(action.query && { query: action.query })
                    }
                  : '#'

              const baseClasses =
                'group flex w-full items-center px-4 py-2 text-sm text-gray-700 transition duration-150 ease-in-out'

              const activeClass = active ? 'bg-gray-100 text-gray-900' : ''

              return action.type === 'link' ? (
                <Link href={href} className={`${baseClasses} ${activeClass}`}>
                  {action.label}
                </Link>
              ) : (
                <button
                  type='button'
                  onClick={() => actionHandler(action)}
                  className={`${baseClasses} ${activeClass}`}
                >
                  {action.label}
                </button>
              )
            }}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}
