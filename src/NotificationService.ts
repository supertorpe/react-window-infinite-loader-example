export interface NotificationDataItem {
    id_notification: string,
    timestamp: string,
    title: string
};

export interface NotificationData {
    items: NotificationDataItem[],
    total_items: number,
    total_pages: number
};

export interface NotificationResponse {
    page: NotificationData,
    not_viewed_count: number
};

const TOTAL_ITEMS = 1000;

export const getNotifications = (page: number, page_size: number): Promise<NotificationResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const total_pages = Math.ceil(TOTAL_ITEMS / page_size);
            const start = (page - 1) * page_size;
            const end = Math.min(start + page_size, TOTAL_ITEMS);

            const items: NotificationDataItem[] = [];

            for (let i = start; i < end; i++) {
                items.push({
                    id_notification: `notif-${i + 1}`,
                    timestamp: new Date(Date.now() - i * 60000).toISOString(),
                    title: `Notification ${i + 1}`
                });
            }

            resolve({
                page: {
                    items,
                    total_items: TOTAL_ITEMS,
                    total_pages
                },
                not_viewed_count: 10
            });
        }, 2000); // simulate 2s delay
    });
};
