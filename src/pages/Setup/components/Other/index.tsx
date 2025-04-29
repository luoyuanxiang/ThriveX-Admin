import { useState } from "react";
import { Segmented } from "antd";
import { HiOutlineMail } from "react-icons/hi";
import BaiduStatistics from './components/BaiduStatistics'

type Tab = "email" | "statis" | "storage" | string

export default () => {
    const [tab, setTab] = useState<Tab>("statis")

    const tabList = [
        {
            label: "百度统计",
            value: "statis",
            icon: <HiOutlineMail />,
            className: "[&>div]:flex [&>div]:items-center [&>div]:!px-4"
        }
    ]

    return (
        <div>
            <Segmented<string>
                size="large"
                options={tabList}
                onChange={setTab}
                className="ml-10"
            />

            {tab === "statis" && <BaiduStatistics />}
        </div>
    )
}