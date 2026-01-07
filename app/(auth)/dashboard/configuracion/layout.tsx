export const dynamic = 'force-dynamic'
import type { Metadata } from 'next';
import Menu from './menu';

import { DollarSign, FilesIcon, HardDrive, Pill } from 'lucide-react';
import AdminPanelLayout from '@/components/dashboard/admin-panel-layout';
import { ContentLayout } from '@/components/dashboard/content-layout';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
    title: {
        default: 'Administrador',
        absolute: 'Administrador'
    }
};
export default function DashboardLayout(props: { children: React.ReactNode, tabs: React.ReactNode, modal: React.ReactNode }) {
    const links = [
        {
            title: "Ganancias",
            icon: (
                <DollarSign />
            ),
            href: "/dashboard/ganancias",
        },

        {
            title: "Medicamentos",
            icon: (
                <Pill />
            ),
            href: "/dashboard/medicamentos",
        },
        {
            title: "Medios",
            icon: (
                <HardDrive />
            ),
            href: "/dashboard/media",
        }
    ];
    return (
        <>
            <ContentLayout title="Configuración">

                <div className="grid px-0 xl:px-40 grid-cols-6 gap-6">
                    <div className="col-span-6 space-y-3">
                        <h1 className='text-3xl font-bold'>
                            Configuración
                        </h1>
                        <p className='text-muted-foreground'>
                            Administra la configuración de tu cuenta y tus compras.
                        </p>
                        <Separator />
                    </div>
                    <ScrollArea className='col-span-6 md:col-span-2 xl:col-span-1'>
                        <Menu />
                        <ScrollBar orientation='horizontal' />
                    </ScrollArea>
                    <div className='col-span-6 md:col-span-4 xl:col-span-5'>
                        {
                            props.tabs
                        }
                    </div>
                </div>
            </ContentLayout>
        </>

    );
}

