'use client'

import { useRef, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Calendar, DollarSign, Home, Info, ReceiptText, User, UserRoundCog, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
const tabs = [
  {
    name: 'Perfil',
    value: 'perfil',
    href: '/dashboard/configuracion/perfil',
    icon: Info
  },
  {
    name: 'Cuenta',
    value: 'cuenta',
    href: '/dashboard/configuracion/cuenta',
    icon: UserRoundCog
  },
  {
    name: 'Compras',
    value: 'compras',
    href: '/dashboard/configuracion/compras',
    icon: DollarSign
  }
]

const Menu = () => {
  const pathname = usePathname()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])



  return (
    <div >
      {/* Eliminé el Link suelto que causaba problemas */}

      <Tabs orientation='vertical' value={''} >
        <TabsList className='flex flex-row md:flex-col w-full  md:gap-1 '>
          {/* Removí el "asChild" y envolví cada tab individualmente */}
          {tabs.map((tab, index) => (
            <TabsTrigger
              key={tab.value}
              value={tab.href}
              ref={el => {
                tabRefs.current[index] = el
              }}

              className={cn("py-2 md:justify-start bg-background w-full  ",
                pathname.includes(tab.href) && (' bg-muted')
              )}

              asChild
            >
              <Link href={tab.href}>
                <tab.icon />
                {tab.name}
              </Link>
            </TabsTrigger>
          ))}


        </TabsList>
      </Tabs>
    </div>
  )
}

export default Menu;