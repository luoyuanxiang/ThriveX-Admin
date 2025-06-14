import React, { ReactNode } from 'react';

interface CardDataStatsProps {
    title: string;
    total: string;
    rate: string;
    levelUp?: boolean;
    levelDown?: boolean;
    linearGradient?: string;
    children: ReactNode;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
    title,
    total,
    rate,
    levelUp,
    levelDown,
    linearGradient = "radial-gradient(at 13.814868431089122% 36.55432836575234%, hsla(33.33333333333323, 100%, 98.23529411764707%, 1) 0%, hsla(33.33333333333323, 100%, 98.23529411764707%, 0) 100%), radial-gradient(at 26.757512289394448% 14.55716430928402%, hsla(201.99999999999997, 100%, 94.11764705882352%, 1) 0%, hsla(201.99999999999997, 100%, 94.11764705882352%, 0) 100%), radial-gradient(at 71.81123062379334% 73.35997062171711%, hsla(201.99999999999997, 100%, 94.11764705882352%, 1) 0%, hsla(201.99999999999997, 100%, 94.11764705882352%, 0) 100%), radial-gradient(at 80.67571417506147% 77.36934613667599%, hsla(33.33333333333323, 100%, 98.23529411764707%, 1) 0%, hsla(33.33333333333323, 100%, 98.23529411764707%, 0) 100%)",
    children
}) => {
    return (
        <div className="rounded-2xl border border-stroke py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark" style={{ backgroundImage: linearGradient }}>
            <h3 className="text-sm text-slate-700 dark:text-white">
                {title}
            </h3>

            <div className="flex items-end justify-between">
                <h4 className="text-title-md font-bold text-black dark:text-white">
                    {total}
                </h4>

                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-lg bg-[#e7f2fe] dark:bg-meta-4">
                    {children}
                </div>
            </div>

            {/* <span
                    className={`flex items-center gap-1 text-sm font-medium ${levelUp && 'text-meta-3'
                        } ${levelDown && 'text-meta-5'} `}
                >
                    {rate}

                    {levelUp && (
                        <svg
                            className="fill-meta-3"
                            width="10"
                            height="11"
                            viewBox="0 0 10 11"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
                                fill=""
                            />
                        </svg>
                    )}
                    {levelDown && (
                        <svg
                            className="fill-meta-5"
                            width="10"
                            height="11"
                            viewBox="0 0 10 11"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M5.64284 7.69237L9.09102 4.33987L10 5.22362L5 10.0849L-8.98488e-07 5.22362L0.908973 4.33987L4.35716 7.69237L4.35716 0.0848701L5.64284 0.0848704L5.64284 7.69237Z"
                                fill=""
                            />
                        </svg>
                    )}
                </span> */}
        </div>
    );
};

export default CardDataStats;
