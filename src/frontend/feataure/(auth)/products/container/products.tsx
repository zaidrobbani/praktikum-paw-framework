"use client";

import { useState } from "react";
import {
  useProductsQuery,
  useProductMutation,
} from "@/frontend/repository/product/query";
import { ProductField } from "../component/ProductField";
import {
  CreateProductRequest,
  UpdateProductRequest,
  Product,
} from "@/frontend/repository/product/dto";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
  DollarSign,
  Layers,
  TrendingUp,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit" | "delete" | null;

type SortField = "name" | "price" | "stock" | "createdAt";
type SortDir = "asc" | "desc";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function Badge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
        Habis
      </span>
    );
  if (stock <= 10)
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
        Menipis
      </span>
    );
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
      Tersedia
    </span>
  );
}

function SortButton({
  field,
  current,
  dir,
  onClick,
}: {
  field: SortField;
  current: SortField;
  dir: SortDir;
  onClick: () => void;
}) {
  const active = current === field;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
    >
      {active ? (
        dir === "asc" ? (
          <ChevronUp size={14} />
        ) : (
          <ChevronDown size={14} />
        )
      ) : (
        <ChevronDown size={14} className="opacity-30" />
      )}
    </button>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

function ProductFormModal({
  mode,
  product,
  onClose,
  onCreate,
  onUpdate,
  isLoading,
}: {
  mode: "create" | "edit";
  product?: Product;
  onClose: () => void;
  onCreate: (data: CreateProductRequest) => void;
  onUpdate: (id: string, data: UpdateProductRequest) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nama produk wajib diisi";
    if (!form.description.trim()) e.description = "Deskripsi wajib diisi";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = "Harga harus angka positif";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = "Stok harus angka positif";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
    };
    if (mode === "create") onCreate(payload);
    else onUpdate(product!.id, payload);
  };

  // NOTE: Field component must not be declared inside render to satisfy lint rule
  // react-hooks/static-components. Kept inline logic is fine; actual component
  // is declared outside below.

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {mode === "create" ? "Tambah Produk" : "Edit Produk"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {mode === "create"
                ? "Isi detail produk baru"
                : "Perbarui informasi produk"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <ProductField
            label="Nama Produk"
            name="name"
            form={form}
            errors={errors}
            setForm={setForm}
            placeholder="Contoh: Kopi Arabica Premium"
          />
          <ProductField
            label="Deskripsi"
            name="description"
            form={form}
            errors={errors}
            setForm={setForm}
            placeholder="Jelaskan produk secara singkat..."
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <ProductField
              label="Harga (IDR)"
              name="price"
              form={form}
              errors={errors}
              setForm={setForm}
              type="number"
              placeholder="50000"
            />
            <ProductField
              label="Stok"
              name="stock"
              form={form}
              errors={errors}
              setForm={setForm}
              type="number"
              placeholder="100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition"
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            {mode === "create" ? "Tambahkan" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  product,
  onClose,
  onConfirm,
  isLoading,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mx-auto mb-4">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 text-center">
          Hapus Produk?
        </h2>
        <p className="text-sm text-slate-500 text-center mt-2">
          Produk{" "}
          <span className="font-semibold text-slate-700">
            &quot;{product.name}&quot;
          </span>{" "}
          akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2 transition"
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  hasSearch,
  onAdd,
}: {
  hasSearch: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Package size={36} className="text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700">
        {hasSearch ? "Produk tidak ditemukan" : "Belum ada produk"}
      </h3>
      <p className="text-sm text-slate-400 mt-1 max-w-xs">
        {hasSearch
          ? "Coba ubah kata kunci pencarian kamu."
          : "Mulai tambahkan produk pertamamu sekarang."}
      </p>
      {!hasSearch && (
        <button
          onClick={onAdd}
          className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 flex items-center gap-2 transition"
        >
          <Plus size={16} /> Tambah Produk
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsContainer() {
  const { data: products = [], isLoading, isError } = useProductsQuery();
  const { createProduct, updateProduct, deleteProduct } = useProductMutation();

  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Filter + sort
  const filtered = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "name") return a.name.localeCompare(b.name) * mul;
      if (sortField === "price") return (a.price - b.price) * mul;
      if (sortField === "stock") return (a.stock - b.stock) * mul;
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        mul
      );
    });

  // Stats
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter((p) => p.stock <= 10).length;

  // Handlers
  const handleCreate = (data: CreateProductRequest) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        showToast("Produk berhasil ditambahkan!");
        closeModal();
      },
      onError: () => showToast("Gagal menambahkan produk.", "error"),
    });
  };

  const handleUpdate = (id: string, data: UpdateProductRequest) => {
    updateProduct.mutate(
      { id, data },
      {
        onSuccess: () => {
          showToast("Produk berhasil diperbarui!");
          closeModal();
        },
        onError: () => showToast("Gagal memperbarui produk.", "error"),
      },
    );
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteProduct.mutate(selected.id, {
      onSuccess: () => {
        showToast("Produk berhasil dihapus!");
        closeModal();
      },
      onError: () => showToast("Gagal menghapus produk.", "error"),
    });
  };

  // ── Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-slate-400" />
          <span className="text-sm">Memuat produk...</span>
        </div>
      </div>
    );
  }

  // ── Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <p className="font-semibold text-slate-700">Gagal memuat produk</p>
          <p className="text-sm text-slate-400">Coba refresh halaman.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-100 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium transition-all ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <ShoppingBag size={26} className="text-slate-700" />
              Manajemen Produk
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {products.length} produk terdaftar
            </p>
          </div>
          <button
            onClick={() => setModal("create")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition shadow-sm"
          >
            <Plus size={16} /> Tambah Produk
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Package}
            label="Total Produk"
            value={products.length}
            color="bg-slate-700"
          />
          <StatCard
            icon={Layers}
            label="Total Stok"
            value={totalStock.toLocaleString("id-ID")}
            color="bg-blue-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Stok Menipis"
            value={lowStock}
            color="bg-amber-500"
          />
          <StatCard
            icon={DollarSign}
            label="Nilai Inventori"
            value={formatPrice(totalValue)}
            color="bg-emerald-500"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="p-5 border-b border-slate-100">
            <div className="relative max-w-sm">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:bg-white transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState hasSearch={!!search} onAdd={() => setModal("create")} />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Produk{" "}
                          <SortButton
                            field="name"
                            current={sortField}
                            dir={sortDir}
                            onClick={() => handleSort("name")}
                          />
                        </div>
                      </th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Harga{" "}
                          <SortButton
                            field="price"
                            current={sortField}
                            dir={sortDir}
                            onClick={() => handleSort("price")}
                          />
                        </div>
                      </th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Stok{" "}
                          <SortButton
                            field="stock"
                            current={sortField}
                            dir={sortDir}
                            onClick={() => handleSort("stock")}
                          />
                        </div>
                      </th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Dibuat{" "}
                          <SortButton
                            field="createdAt"
                            current={sortField}
                            dir={sortDir}
                            onClick={() => handleSort("createdAt")}
                          />
                        </div>
                      </th>
                      <th className="px-6 py-3.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">
                              {product.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-700">
                            {formatPrice(product.price)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {product.stock.toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge stock={product.stock} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-400">
                            {formatDate(product.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSelected(product);
                                setModal("edit");
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => {
                                setSelected(product);
                                setModal("delete");
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {filtered.map((product) => (
                  <div key={product.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800">
                            {product.name}
                          </p>
                          <Badge stock={product.stock} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm font-bold text-slate-700">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs text-slate-500">
                            Stok: {product.stock}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setSelected(product);
                            setModal("edit");
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setSelected(product);
                            setModal("delete");
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40">
                <p className="text-xs text-slate-400">
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-600">
                    {filtered.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-600">
                    {products.length}
                  </span>{" "}
                  produk
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {(modal === "create" || modal === "edit") && (
        <ProductFormModal
          mode={modal}
          product={selected ?? undefined}
          onClose={closeModal}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          isLoading={createProduct.isPending || updateProduct.isPending}
        />
      )}

      {modal === "delete" && selected && (
        <DeleteModal
          product={selected}
          onClose={closeModal}
          onConfirm={handleDelete}
          isLoading={deleteProduct.isPending}
        />
      )}
    </div>
  );
}
