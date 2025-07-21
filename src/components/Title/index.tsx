import { Card } from 'antd'
import { titleSty } from '@/styles/sty'
import { ReactNode } from 'react'

interface Props {
    value: string,
    children?: ReactNode,
    className?: string
}

export default ({ value, children, className }: Props) => {
    return (
        <>
            <Card className={`${titleSty} px-4 mb-2 ${className}`}>
                <div className="overflow-auto flex justify-between items-center h-14">
                    <h2 className="font-semibold text-black dark:text-white text-xl min-w-24">{value}</h2>

                    {children}
                </div>
            </Card>
        </>
    )
}