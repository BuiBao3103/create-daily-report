import { MantineLoaderComponent } from "@mantine/core";
import { RingLoader } from "./RingLoader";

type LoaderMap = {
    [key: string]: MantineLoaderComponent;
};

const loaderMap: LoaderMap = {
    'ring': RingLoader,
};

export default function MyLoader({ type = 'ring', ...props }) {
    const Component = loaderMap[type] ?? RingLoader;
    return <Component {...props} />;
}