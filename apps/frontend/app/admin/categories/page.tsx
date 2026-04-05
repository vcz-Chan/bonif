"use client"

import { useCallback, useEffect, useState } from "react"
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@bon/contracts"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, Edit, FileText, Plus, Search, Trash2 } from "lucide-react"

import { LogoutButton } from "@/components/auth/logout-button"
import { useRequireAuth } from "@/components/auth/auth-provider"
import { createCategory, deleteCategory, getCategories, updateCategory } from "@/lib/api/admin-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import type { Category } from "@/types"
import { useToast } from "@/components/ui/toast"

type CategoryFormState = {
    code: string
    name: string
    description: string
    sort_order: number
    is_active: boolean
}

type CategorySavePayload = {
    name: string
    description: string | null
    sort_order: number
    is_active: boolean
    code?: string
}

const emptyForm: CategoryFormState = {
    code: "",
    name: "",
    description: "",
    sort_order: 0,
    is_active: true
}

type CategoryStatusFilter = "all" | "active" | "inactive"
type CategorySortOption = "sort_order" | "name" | "article_count"

export default function AdminCategoriesPage() {
    const router = useRouter()
    const { showToast } = useToast()

    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState<Category | null>(null)
    const [form, setForm] = useState<CategoryFormState>(emptyForm)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<CategoryStatusFilter>("all")
    const [sortBy, setSortBy] = useState<CategorySortOption>("sort_order")
    const { isAuthorized, isLoading } = useRequireAuth({
        requiredRole: "admin",
        forbiddenMessage: "관리자만 접근 가능합니다."
    })

    const fetchCategories = useCallback(async () => {
        setLoading(true)
        try {
            setCategories(await getCategories())
        } catch (error) {
            showToast(error instanceof Error ? error.message : "오류가 발생했습니다.", "error")
        } finally {
            setLoading(false)
        }
    }, [showToast])

    useEffect(() => {
        if (!isAuthorized) {
            return
        }

        void fetchCategories()
    }, [fetchCategories, isAuthorized])

    const openCreate = () => {
        setEditing(null)
        setForm(emptyForm)
        setModalOpen(true)
    }

    const openEdit = (category: Category) => {
        setEditing(category)
        setForm({
            code: category.code,
            name: category.name,
            description: category.description || "",
            sort_order: Number(category.sort_order) || 0,
            is_active: category.is_active
        })
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditing(null)
        setForm(emptyForm)
    }

    const handleSave = async () => {
        const name = form.name.trim()
        const code = form.code.trim()

        if (!name) {
            showToast("카테고리 이름은 필수입니다.", "warning")
            return
        }
        if (!editing && !code) {
            showToast("카테고리 코드는 필수입니다.", "warning")
            return
        }

        setSaving(true)
        try {
            const payload: CategorySavePayload = {
                name,
                description: form.description.trim() || null,
                sort_order: Number(form.sort_order) || 0,
                is_active: form.is_active
            }

            if (!editing) {
                payload.code = code
            }

            if (editing) {
                await updateCategory(editing.id, payload as UpdateCategoryRequest)
            } else {
                await createCategory(payload as CreateCategoryRequest)
            }

            showToast(editing ? "수정되었습니다." : "등록되었습니다.", "success")
            closeModal()
            void fetchCategories()
        } catch (error) {
            showToast(error instanceof Error ? error.message : "오류가 발생했습니다.", "error")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (category: Category) => {
        if (!confirm("정말 삭제하시겠습니까? 관련 문서도 함께 숨김 처리됩니다.")) return

        try {
            await deleteCategory(category.id)
            showToast("삭제되었습니다.", "success")
            void fetchCategories()
        } catch (error) {
            showToast(error instanceof Error ? error.message : "오류가 발생했습니다.", "error")
        }
    }

    const getArticleCount = (category: Category) => Number(category.article_count ?? 0) || 0
    const totalArticleCount = categories.reduce((sum, category) => sum + getArticleCount(category), 0)
    const activeCategoryCount = categories.filter((category) => category.is_active).length
    const normalizedSearch = search.trim().toLowerCase()

    const filteredCategories = [...categories]
        .filter((category) => {
            if (statusFilter === "active" && !category.is_active) {
                return false
            }

            if (statusFilter === "inactive" && category.is_active) {
                return false
            }

            if (!normalizedSearch) {
                return true
            }

            return [category.name, category.code, category.description || ""]
                .join(" ")
                .toLowerCase()
                .includes(normalizedSearch)
        })
        .sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name, "ko")
            }

            if (sortBy === "article_count") {
                return getArticleCount(b) - getArticleCount(a) || a.name.localeCompare(b.name, "ko")
            }

            return Number(a.sort_order) - Number(b.sort_order) || a.name.localeCompare(b.name, "ko")
        })

    const navigateToCategoryArticles = (categoryId: string) => {
        router.push(`/admin/articles?category=${categoryId}`)
    }

    if (isLoading || !isAuthorized) {
        return <div className="p-8 text-center text-slate-500">권한 확인 중...</div>
    }

    return (
        <div className="min-h-[100dvh] p-4 md:p-8">
            <div className="mx-auto flex max-w-7xl flex-col rounded-xl bg-white/90 shadow-xl backdrop-blur-sm">
                <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/50 px-4 py-4 backdrop-blur-md md:px-6">
                    <div className="flex min-w-0 items-center gap-3 md:gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Button>
                        <h1 className="text-xl font-bold text-slate-900">카테고리 관리</h1>
                    </div>
                    <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                        <LogoutButton className="hidden sm:inline-flex" />
                        <Button variant="gradient" className="w-full gap-2 sm:w-auto" onClick={openCreate}>
                            <Plus className="w-4 h-4" /> 새 카테고리
                        </Button>
                    </div>
                </header>

                <main className="flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8">
                    <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">전체</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{categories.length}</p>
                            <p className="mt-1 text-xs text-slate-500">등록된 카테고리 수</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">활성</p>
                            <p className="mt-2 text-2xl font-bold text-emerald-700">{activeCategoryCount}</p>
                            <p className="mt-1 text-xs text-emerald-700/80">노출 중인 카테고리</p>
                        </div>
                        <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-sm md:col-span-1">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">문서</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{totalArticleCount}</p>
                            <p className="mt-1 text-xs text-slate-500">카테고리에 연결된 전체 문서</p>
                        </div>
                    </section>

                    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="카테고리명, 코드, 설명 검색"
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:flex md:w-auto">
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-bon-green-start"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as CategoryStatusFilter)}
                            >
                                <option value="all">전체 상태</option>
                                <option value="active">활성만</option>
                                <option value="inactive">비활성만</option>
                            </select>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-bon-green-start"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as CategorySortOption)}
                            >
                                <option value="sort_order">정렬순</option>
                                <option value="name">이름순</option>
                                <option value="article_count">문서 많은순</option>
                            </select>
                        </div>
                    </section>

                    <section className="space-y-3 md:hidden">
                        {loading ? (
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-500 shadow-sm">
                                로딩 중...
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center shadow-sm">
                                <p className="text-sm font-medium text-slate-900">
                                    {categories.length === 0 ? "등록된 카테고리가 없습니다." : "조건에 맞는 카테고리가 없습니다."}
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    {categories.length === 0 ? "첫 카테고리를 추가해서 문서 구조를 정리하세요." : "검색어나 필터를 조정해 다시 확인하세요."}
                                </p>
                                {categories.length === 0 && (
                                    <Button variant="gradient" className="mt-4 w-full gap-2" onClick={openCreate}>
                                        <Plus className="w-4 h-4" /> 새 카테고리
                                    </Button>
                                )}
                            </div>
                        ) : filteredCategories.map((category) => (
                            <article
                                key={category.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="truncate text-base font-bold text-slate-900">{category.name}</h2>
                                            <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                                {category.code}
                                            </span>
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                            {category.description || "카테고리 설명이 아직 없습니다."}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            category.is_active
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        {category.is_active ? "활성" : "비활성"}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 px-3 py-3">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            정렬 순서
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-slate-700">{category.sort_order}</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="rounded-xl border border-transparent px-2 py-1 text-left transition-colors hover:border-slate-200 hover:bg-white"
                                        onClick={() => navigateToCategoryArticles(category.id)}
                                    >
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            연결 문서
                                        </p>
                                        <p className="mt-1 flex items-center gap-1 whitespace-nowrap text-sm font-medium text-slate-700">
                                            <FileText className="h-4 w-4 text-slate-400" />
                                            {getArticleCount(category)}
                                        </p>
                                    </button>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 gap-2"
                                        onClick={() => navigateToCategoryArticles(category.id)}
                                    >
                                        <FileText className="w-4 h-4" />
                                        문서 보기
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="gap-2 px-4"
                                        onClick={() => openEdit(category)}
                                    >
                                        <Edit className="w-4 h-4" />
                                        수정
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="gap-2 px-4 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => handleDelete(category)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        삭제
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </section>

                    <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm md:block">
                        <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 md:px-6 w-28">코드</th>
                                        <th className="px-4 py-3 md:px-6 w-48">이름</th>
                                        <th className="px-4 py-3 md:px-6">설명</th>
                                        <th className="px-4 py-3 md:px-6 w-24 text-center">정렬</th>
                                        <th className="px-4 py-3 md:px-6 w-24 text-center">상태</th>
                                        <th className="px-4 py-3 md:px-6 w-24 text-center">문서</th>
                                        <th className="px-4 py-3 md:px-6 w-24 text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 md:px-6 text-center text-slate-500">로딩 중...</td>
                                        </tr>
                                    ) : filteredCategories.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 md:px-6 text-center text-slate-500">
                                                {categories.length === 0 ? "카테고리가 없습니다." : "조건에 맞는 카테고리가 없습니다."}
                                            </td>
                                        </tr>
                                    ) : filteredCategories.map((category) => (
                                        <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 md:px-6 align-middle">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs whitespace-nowrap">
                                                    {category.code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 md:px-6 align-middle">
                                                <button
                                                    type="button"
                                                    className="text-left"
                                                    onClick={() => navigateToCategoryArticles(category.id)}
                                                >
                                                    <span className="font-medium text-slate-900 transition-colors hover:text-bon-green-start">
                                                        {category.name}
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 md:px-6 text-slate-600 align-middle">
                                                <div className="line-clamp-2 min-w-[220px]">
                                                    {category.description || "설명 없음"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 md:px-6 text-center text-slate-600 align-middle">
                                                {category.sort_order}
                                            </td>
                                            <td className="px-4 py-3 md:px-6 text-center align-middle">
                                                {category.is_active ? (
                                                    <span className="text-green-600 text-xs font-semibold">활성</span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">비활성</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 md:px-6 text-center text-slate-600 align-middle">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                                                    onClick={() => navigateToCategoryArticles(category.id)}
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {getArticleCount(category)}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 md:px-6 text-right align-middle">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                                                        onClick={() => navigateToCategoryArticles(category.id)}
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                                                        onClick={() => openEdit(category)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"
                                                        onClick={() => handleDelete(category)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                    </div>
                </main>
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? "카테고리 수정" : "카테고리 추가"}
            >
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (!saving) handleSave()
                    }}
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">코드</label>
                        <Input
                            placeholder="예: STORAGE"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                            disabled={!!editing}
                        />
                        {editing && (
                            <p className="text-xs text-slate-400">코드는 생성 후 변경할 수 없습니다.</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">이름</label>
                        <Input
                            placeholder="카테고리 이름"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">설명 (선택)</label>
                        <textarea
                            className="w-full min-h-[80px] rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-bon-green-start outline-none resize-none"
                            placeholder="카테고리 설명을 입력하세요"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">정렬 순서</label>
                            <Input
                                type="number"
                                value={form.sort_order}
                                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                    className="w-4 h-4 text-bon-green-start border-gray-300 rounded focus:ring-bon-green-start"
                                />
                                <span className="text-sm font-medium text-slate-700">활성 상태</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={closeModal}>
                            취소
                        </Button>
                        <Button type="submit" variant="gradient" disabled={saving}>
                            {saving ? "저장 중..." : "저장"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
