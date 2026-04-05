"use client"

import type { AdminRecentActivityItem } from "@bon/contracts"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
    BarChart3,
    Bot,
    ChevronRight,
    FileText,
    Folder,
    Home,
    MessagesSquare,
    Store
} from "lucide-react"

import { PreviewChatModal } from "@/components/admin/preview-chat-modal"
import { LogoutButton } from "@/components/auth/logout-button"
import { useRequireAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { getCategories, getRecentActivities } from "@/lib/api/admin-client"
import { formatRelativeKoreanTime } from "@/lib/date"
import type { Category } from "@/types"

export default function AdminPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [recentActivities, setRecentActivities] = useState<AdminRecentActivityItem[]>([])
    const [loading, setLoading] = useState(true)
    const [recentActivitiesLoading, setRecentActivitiesLoading] = useState(false)
    const [recentActivitiesError, setRecentActivitiesError] = useState<string | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [isDesktopViewport, setIsDesktopViewport] = useState(false)
    const recentActivitiesRequestRef = useRef(0)

    const { isAuthorized, isLoading } = useRequireAuth({
        requiredRole: "admin",
        forbiddenMessage: "관리자만 접근 가능합니다."
    })

    const fetchCategories = useCallback(async () => {
        try {
            setCategories(await getCategories())
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchRecentActivities = useCallback(async () => {
        const requestId = ++recentActivitiesRequestRef.current
        setRecentActivitiesLoading(true)
        setRecentActivitiesError(null)

        try {
            const items = await getRecentActivities(5)

            if (requestId !== recentActivitiesRequestRef.current) {
                return
            }

            setRecentActivities(items)
        } catch (error) {
            if (requestId !== recentActivitiesRequestRef.current) {
                return
            }

            console.error(error)
            setRecentActivities([])
            setRecentActivitiesError(
                error instanceof Error ? error.message : "최근 활동을 불러오지 못했습니다."
            )
        } finally {
            if (requestId === recentActivitiesRequestRef.current) {
                setRecentActivitiesLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)")
        const syncViewport = () => {
            setIsDesktopViewport(mediaQuery.matches)
        }

        syncViewport()

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", syncViewport)
            return () => mediaQuery.removeEventListener("change", syncViewport)
        }

        mediaQuery.addListener(syncViewport)
        return () => mediaQuery.removeListener(syncViewport)
    }, [])

    useEffect(() => {
        if (!isAuthorized) return
        void fetchCategories()
    }, [fetchCategories, isAuthorized])

    useEffect(() => {
        if (!isAuthorized || !isDesktopViewport) {
            if (!isDesktopViewport) {
                recentActivitiesRequestRef.current += 1
                setRecentActivities([])
                setRecentActivitiesLoading(false)
                setRecentActivitiesError(null)
            }

            return
        }

        void fetchRecentActivities()
    }, [fetchRecentActivities, isAuthorized, isDesktopViewport])

    if (isLoading || !isAuthorized) {
        return <div className="p-8 text-center text-slate-500">권한 확인 중...</div>
    }

    const desktopNavigationItems = [
        { id: "overview", label: "대시보드", description: "현황 요약", icon: Home, onClick: () => router.push("/admin") },
        { id: "branches", label: "지점 관리", description: "계정 및 상태", icon: Store, onClick: () => router.push("/admin/branches") },
        { id: "sessions", label: "대화 모니터링", description: "세션과 메시지", icon: MessagesSquare, onClick: () => router.push("/admin/chat-sessions") },
        { id: "categories", label: "카테고리 설정", description: "문서 분류와 관리", icon: Folder, onClick: () => router.push("/admin/categories") },
        { id: "chatbot", label: "챗봇 테스트", description: "응답 점검", icon: Bot, onClick: () => setPreviewOpen(true) }
    ] as const

    const categoryPreviewItems = categories.slice(0, 6)

    return (
        <>
            <div className="hidden min-h-[100dvh] bg-slate-50 lg:flex">
                <aside className="sticky top-0 flex h-[100dvh] w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Admin Console</p>
                        <h1 className="mt-2 text-xl font-bold text-slate-900">관리자 패널</h1>
                        <p className="mt-1 text-sm text-slate-500">기능 진입점을 한 곳에 모은 운영 허브</p>
                    </div>

                    <nav className="flex-1 p-4">
                        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Navigation
                        </p>
                        <div className="space-y-2">
                            {desktopNavigationItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.id}
                                    onClick={item.onClick}
                                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                                        item.id === "overview"
                                            ? "border-bon-burgundy/20 bg-bon-burgundy/5 text-bon-burgundy shadow-sm"
                                            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`rounded-xl p-2 ${
                                            item.id === "overview"
                                                ? "bg-bon-burgundy/10"
                                                : item.id === "sessions"
                                                    ? "bg-bon-green-start/15"
                                                    : "bg-slate-100"
                                        }`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold">{item.label}</p>
                                            <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                                        </div>
                                    </div>
                                </button>
                            )
                            })}
                        </div>
                    </nav>

                    <div className="border-t border-slate-200 p-4">
                        <LogoutButton />
                    </div>
                </aside>

                <div className="flex-1">
                    <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
                        <p className="text-sm font-medium text-slate-500">운영 현황과 주요 관리 진입점</p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-900">대시보드</h2>
                    </header>

                    <main className="p-8">
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-8">
                            <Card
                                className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-bon-burgundy/30"
                                onClick={() => router.push("/admin/branches")}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
                                        <Store className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">지점 관리</h3>
                                <p className="text-sm text-slate-600">지점 계정 생성, 상태 확인, 비밀번호 변경</p>
                            </Card>

                            <Card
                                className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-bon-green-start/30"
                                onClick={() => router.push("/admin/chat-sessions")}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-bon-green-start/20 to-bon-green-end/20">
                                        <MessagesSquare className="w-6 h-6 text-bon-green-start" />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">대화 모니터링</h3>
                                <p className="text-sm text-slate-600">지점별 세션과 최근 문의 흐름을 빠르게 확인</p>
                            </Card>

                            <Card
                                className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-slate-400/30"
                                onClick={() => router.push("/admin/categories")}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
                                        <Folder className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">카테고리 설정</h3>
                                <p className="text-sm text-slate-600">문서 분류 체계를 관리하고 카테고리별 문서로 이동</p>
                            </Card>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                            <section className="rounded-xl border border-slate-200 bg-white p-6">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">카테고리 바로가기</h3>
                                        <p className="mt-1 text-sm text-slate-500">대시보드에서 자주 쓰는 카테고리로 바로 이동</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push("/admin/categories")}
                                    >
                                        전체 관리
                                    </Button>
                                </div>

                                {loading ? (
                                    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">로딩 중...</div>
                                ) : categoryPreviewItems.length === 0 ? (
                                    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                        등록된 카테고리가 없습니다.
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {categoryPreviewItems.map((cat) => (
                                            <Card
                                                key={cat.id}
                                                className="p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md group"
                                                onClick={() => router.push(`/admin/articles?category=${cat.id}`)}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                        {cat.code}
                                                    </span>
                                                </div>
                                                <h4 className="mb-2 truncate text-base font-bold text-slate-900">
                                                    {cat.name}
                                                </h4>
                                                <p className="mb-4 truncate text-sm text-slate-600">
                                                    {cat.description || "설명 없음"}
                                                </p>
                                                <div className="flex items-center text-sm text-slate-500">
                                                    <FileText className="w-4 h-4 mr-1" />
                                                    <span>{cat.article_count}개 문서</span>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="bg-white rounded-xl border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">최근 대화</h3>
                                <p className="mb-4 text-sm text-slate-500">운영 중 확인이 필요한 최근 문의 흐름</p>
                                <div className="space-y-3">
                                    {recentActivitiesLoading ? (
                                        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                            <Spinner size="sm" className="text-bon-green-start" />
                                            최근 활동을 불러오는 중...
                                        </div>
                                    ) : recentActivitiesError ? (
                                        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600">
                                            {recentActivitiesError}
                                        </div>
                                    ) : recentActivities.length === 0 ? (
                                        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                            표시할 최근 활동이 없습니다.
                                        </div>
                                    ) : (
                                        recentActivities.map((activity) => (
                                            <div
                                                key={activity.message_id}
                                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50"
                                            >
                                                <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        지점 {activity.branch_code}의 최근 문의
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                                                        {activity.message}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {formatRelativeKoreanTime(activity.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>

            <div className="flex min-h-[100dvh] flex-col bg-slate-50 lg:hidden">
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Admin
                            </p>
                            <h1 className="text-lg font-bold text-slate-900">관리자 대시보드</h1>
                        </div>
                        <LogoutButton />
                    </div>
                </header>

                <main className="flex-1 px-4 pb-24 pt-5">
                    <section className="grid grid-cols-2 gap-3">
                        <Card
                            className="p-4 active:scale-[0.98] transition-transform"
                            onClick={() => router.push("/admin/branches")}
                        >
                            <div className="flex flex-col items-start">
                                <div className="mb-3 rounded-xl bg-slate-100 p-3">
                                    <Store className="w-5 h-5 text-slate-700" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">지점 관리</h3>
                                <p className="mt-1 text-xs leading-5 text-slate-500">계정 생성 및 상태 관리</p>
                            </div>
                        </Card>

                        <Card
                            className="p-4 active:scale-[0.98] transition-transform"
                            onClick={() => router.push("/admin/chat-sessions")}
                        >
                            <div className="flex flex-col items-start">
                                <div className="mb-3 rounded-xl bg-bon-green-start/20 p-3">
                                    <MessagesSquare className="w-5 h-5 text-bon-green-start" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">대화 조회</h3>
                                <p className="mt-1 text-xs leading-5 text-slate-500">지점별 세션과 답변 확인</p>
                            </div>
                        </Card>

                        <Card
                            className="p-4 active:scale-[0.98] transition-transform"
                            onClick={() => router.push("/admin/categories")}
                        >
                            <div className="flex flex-col items-start">
                                <div className="mb-3 rounded-xl bg-slate-100 p-3">
                                    <Folder className="w-5 h-5 text-slate-700" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">카테고리 설정</h3>
                                <p className="mt-1 text-xs leading-5 text-slate-500">문서 분류와 관리 화면</p>
                            </div>
                        </Card>

                        <Card
                            className="p-4 active:scale-[0.98] transition-transform"
                            onClick={() => setPreviewOpen(true)}
                        >
                            <div className="flex flex-col items-start">
                                <div className="mb-3 rounded-xl bg-bon-burgundy/10 p-3">
                                    <Bot className="w-5 h-5 text-bon-burgundy" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">챗봇 테스트</h3>
                                <p className="mt-1 text-xs leading-5 text-slate-500">관리자 권한으로 응답 점검</p>
                            </div>
                        </Card>
                    </section>

                    <section className="mt-6">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">주요 카테고리</h2>
                                <p className="mt-1 text-xs text-slate-500">자주 쓰는 문서 카테고리로 바로 이동</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/admin/categories")}
                            >
                                전체 보기
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {loading ? (
                                <p className="py-4 text-center text-slate-500">로딩 중...</p>
                            ) : (
                                categoryPreviewItems.map((cat) => (
                                    <Card
                                        key={cat.id}
                                        className="p-4 active:bg-slate-50"
                                        onClick={() => router.push(`/admin/articles?category=${cat.id}`)}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="truncate text-sm font-bold text-slate-900">
                                                        {cat.name}
                                                    </h3>
                                                    <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                                        {cat.code}
                                                    </span>
                                                </div>
                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                    {cat.description || `${cat.article_count}개 문서`}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </section>
                </main>

                <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white safe-area-bottom">
                    <div className="grid grid-cols-4">
                        <button
                            onClick={() => router.push("/admin")}
                            className="flex flex-col items-center gap-1 py-3 text-bon-burgundy"
                        >
                            <Home className="w-5 h-5" />
                            <span className="text-xs">홈</span>
                        </button>
                        <button
                            onClick={() => router.push("/admin/branches")}
                            className="flex flex-col items-center gap-1 py-3 text-slate-500"
                        >
                            <Store className="w-5 h-5" />
                            <span className="text-xs">지점</span>
                        </button>
                        <button
                            onClick={() => router.push("/admin/categories")}
                            className="flex flex-col items-center gap-1 py-3 text-slate-500"
                        >
                            <Folder className="w-5 h-5" />
                            <span className="text-xs">카테고리</span>
                        </button>
                        <button
                            onClick={() => router.push("/admin/chat-sessions")}
                            className="flex flex-col items-center gap-1 py-3 text-slate-500"
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span className="text-xs">세션</span>
                        </button>
                    </div>
                </nav>
            </div>

            <PreviewChatModal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
        </>
    )
}
