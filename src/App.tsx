import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import { List, type RowComponentProps } from 'react-window';
import { useInfiniteLoader } from 'react-window-infinite-loader';
import {
    IconButton,
    Menu,
    MenuItem,
    Badge,
    Typography,
    Divider,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { getNotifications } from './NotificationService';
import type { NotificationDataItem } from './NotificationService';

type Row = NotificationDataItem | null;

function RowComponent({
    index,
    rows,
    style,
}: RowComponentProps<{
    rows: Row[];
}>) {
    const row = rows[index];
    return (
        <div style={style}>
            {row ? (
                <>
                    <Typography variant="subtitle2">{row.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(row.timestamp).toLocaleString()}
                    </Typography>
                </>
            ) : (
                'Loading...'
            )}
        </div>
    );
}

export default function App() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [rows, setRows] = useState<Row[]>([]);

    const handleOpen = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const isRowLoaded = useCallback(
        (index: number) => rows[index] !== undefined,
        [rows]
    );

    const loadMoreRows = useCallback((startIndex: number, stopIndex: number) => {
        console.log(`Loading more rows... ${startIndex} - ${stopIndex}`);

        // mark loading placeholders
        setRows((prev) => {
            const next = [...prev];
            for (let index = startIndex; index <= stopIndex; index++) {
                next[index] = null;
            }
            return next;
        });

        // ✅ replaced setTimeout with real fake API call
        const pageSize = stopIndex - startIndex + 1;
        const page = Math.floor(startIndex / pageSize) + 1;

        return getNotifications(page, pageSize).then((response) => {
            setRows((prev) => {
                const next = [...prev];
                response.page.items.forEach((item, idx) => {
                    next[startIndex + idx] = item;
                });
                return next;
            });
            console.log(`Loaded rows... ${startIndex} - ${stopIndex}`);
        });
    }, []);

    const onRowsRendered = useInfiniteLoader({
        isRowLoaded,
        loadMoreRows,
        threshold: 1,
        minimumBatchSize: 10,
        rowCount: 1000,
    });

    return (
        <>
            <p className="text-sm">
                This demo app mimics loading remote data with a 2 second timer. While
                rows are "loading" they will display a "Loading..." label. Once data has
                been "loaded" the title and timestamp will be displayed.
            </p>
            <p className="text-sm">
                Rows in memory: {rows.reduce((count, row) => count + (row ? 1 : 0), 0)}
            </p>
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={10} color="warning">
                    <NotificationsOutlinedIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{ sx: { minWidth: 280 } }}
            >
                <MenuItem disabled>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        10 Notifications
                    </Typography>
                </MenuItem>
                <Divider />
                <div className="w-100 h-50">
                    <List
                        className="List"
                        onRowsRendered={onRowsRendered}
                        rowComponent={RowComponent}
                        rowCount={1000}
                        rowHeight={50}
                        rowProps={{ rows }}
                    />
                </div>
                <Divider />
                <MenuItem
                    onClick={handleClose}
                    sx={{ justifyContent: "center" }}
                >
                    See All Notifications
                </MenuItem>
            </Menu>
        </>
    );
}
