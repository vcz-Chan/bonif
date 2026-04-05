const koreanDateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul"
})

export function formatKoreanDateTime(value: string | null, fallback = "메시지 없음") {
    if (!value) {
        return fallback
    }

    return koreanDateTimeFormatter.format(new Date(value))
}

const koreanRelativeTimeFormatter = new Intl.RelativeTimeFormat("ko-KR", {
    numeric: "auto"
})

const MINUTE_IN_MS = 60 * 1000
const HOUR_IN_MS = 60 * MINUTE_IN_MS
const DAY_IN_MS = 24 * HOUR_IN_MS

export function formatRelativeKoreanTime(value: string | null, fallback = "시간 정보 없음") {
    if (!value) {
        return fallback
    }

    const targetTime = new Date(value).getTime()

    if (Number.isNaN(targetTime)) {
        return fallback
    }

    const diffInMs = targetTime - Date.now()
    const absDiffInMs = Math.abs(diffInMs)

    if (absDiffInMs < 45 * 1000) {
        return "방금 전"
    }

    if (absDiffInMs < 45 * MINUTE_IN_MS) {
        return koreanRelativeTimeFormatter.format(Math.round(diffInMs / MINUTE_IN_MS), "minute")
    }

    if (absDiffInMs < 22 * HOUR_IN_MS) {
        return koreanRelativeTimeFormatter.format(Math.round(diffInMs / HOUR_IN_MS), "hour")
    }

    if (absDiffInMs < 7 * DAY_IN_MS) {
        return koreanRelativeTimeFormatter.format(Math.round(diffInMs / DAY_IN_MS), "day")
    }

    return koreanDateTimeFormatter.format(new Date(value))
}
