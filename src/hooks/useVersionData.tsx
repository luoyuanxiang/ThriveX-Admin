import { useState, useEffect } from 'react';
import axios from 'axios';

interface Version { name: string, tag_name: string, html_url: string }

const useVersionData = () => {
    const [version, setVersion] = useState<Version>({} as Version);

    useEffect(() => {
        const getVersionData = async () => {
            const project_version = JSON.parse(sessionStorage.getItem('project_version') || '{}');
            if (Object.keys(project_version).length !== 0) return setVersion(project_version);
            const { data } = await axios.get("https://api.github.com/repos/LiuYuYang01/ThriveX-Admin/releases/latest");
            setVersion(data);
            sessionStorage.setItem('project_version', JSON.stringify(data));
        };

        getVersionData();
    }, []);

    return version;
};

export default useVersionData;