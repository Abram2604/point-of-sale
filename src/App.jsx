import { useEffect, useMemo, useState } from 'react'
import {
  Container, Row, Col, Card,
  Form, Button, Table,
  Toast, ToastContainer
} from 'react-bootstrap'

export default function App() {
  // Data awal, useMemo digunakan agar data ini tidak dibuat ulang setiap render
  const initialProducts = useMemo(() => ([
    { id: 1, name: 'Makanan', description: 'Produk makanan siap saji' },
    { id: 2, name: 'Minuman', description: 'Aneka minuman dingin & hangat' },
  ]), [])

  // State untuk menyimpan daftar produk
  const [products, setProducts] = useState(() => {
    // Coba ambil data dari localStorage
    const savedProducts = localStorage.getItem('products');
    // Jika ada, parse dari string JSON ke array. Jika tidak, gunakan data awal.
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });
  // State untuk form input nama
  const [name, setName] = useState('')
  // State untuk form input deskripsi
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [stock, setStock] = useState(0);
  const [isActive, setIsActive] = useState(true);
  // State untuk menyimpan pesan error validasi
  const [errors, setErrors] = useState({})
  // State untuk melacak ID produk yang sedang diedit (null jika sedang mode tambah)
  const [editingId, setEditingId] = useState(null)
  
  // State untuk notifikasi Toast
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState('success') // 'success' atau 'danger'
  // useEffect ini akan berjalan setiap kali state 'products' berubah
  useEffect(() => {
    // Simpan state products ke localStorage sebagai string JSON
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]); // <-- Dependency array, hook ini hanya berjalan jika 'products' berubah
  const validate = () => {
    const newErrors = {}
    const trimmedName = name.trim()

    if (!trimmedName) {
      newErrors.name = 'Nama Produk wajib diisi.'
    } else if (trimmedName.length < 3) {
      newErrors.name = 'Minimal 3 karakter.'
    } else if (trimmedName.length > 50) {
      newErrors.name = 'Maksimal 50 karakter.'
    } else {
      // Cek duplikasi nama, pastikan tidak sama dengan data lain saat mengedit
      const isDuplicate = products.some(
        c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingId
      )
      if (isDuplicate) {
        newErrors.name = 'Nama Produk sudah ada.'
      }
    }

    if (description.length > 200) {
      newErrors.description = 'Deskripsi maksimal 200 karakter.'
    }
    // Validasi Harga
    if (!price) {
      newErrors.price = 'Harga wajib diisi.';
    } else if (isNaN(price) || Number(price) <= 0) {
      newErrors.price = 'Harga harus angka dan lebih dari 0.';
    }
    
    // Validasi Kategori
    if (!category) {
      newErrors.category = 'Kategori wajib dipilih.';
    }
      if (!releaseDate) {
      newErrors.releaseDate = 'Tanggal Rilis wajib diisi.';
    } else {
      const selectedDate = new Date(releaseDate);
      const today = new Date();
      // Mengatur jam ke 0 untuk membandingkan hanya tanggalnya
      today.setHours(0, 0, 0, 0); 

      if (selectedDate > today) {
        newErrors.releaseDate = 'Tanggal Rilis tidak boleh di masa depan.';
      }
      }
     if (stock === '' || stock === null) {
      newErrors.stock = 'Stok wajib diisi.';
    } else if (isNaN(stock) || Number(stock) < 0) {
      newErrors.stock = 'Stok harus angka dan tidak boleh negatif.';
    }
    return newErrors
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setPrice('');
    setCategory('');
    setReleaseDate('');
    setErrors({})
    setEditingId(null)
  }

  const showToastMsg = (message, variant = 'success') => {
    setToastMessage(message)
    setToastVariant(variant)
    setShowToast(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault() // Mencegah form refresh halaman
    const validationErrors = validate()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      showToastMsg('Periksa kembali input Anda.', 'danger')
      return
    }

    if (editingId === null) {
      // --- LOGIKA CREATE (TAMBAH DATA) ---
      const newCategory = {
        id: Date.now(), // ID unik sederhana
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: category,
        releaseDate: releaseDate,
      }
      setProducts(prev => [newCategory, ...prev])
      showToastMsg('Produk berhasil ditambahkan.', 'success')
    } else {
      // --- LOGIKA UPDATE (UBAH DATA) ---
      setProducts(prev =>
        prev.map(c =>
          c.id === editingId ? { ...c, name: name.trim(), description: description.trim(),price: Number(price), category: category, releaseDate: releaseDate } : c
        )
      )
      showToastMsg('Produk berhasil diperbarui.', 'success')
    }
    
    resetForm()
  }

  const handleEdit = (cat) => {
    setEditingId(cat.id)
    setName(cat.name)
    setDescription(cat.description || '')
    setPrice(cat.price || ''); 
    setCategory(cat.category || '');
    setReleaseDate(cat.releaseDate || '');
    setErrors({})
  }

  const handleDelete = (id) => {
    const target = products.find(c => c.id === id)
    if (!target) return
    
    if (window.confirm(`Hapus Produk "${target.name}"?`)) {
      setProducts(prev => prev.filter(c => c.id !== id))
      if (editingId === id) resetForm()
      showToastMsg('Produk berhasil dihapus.', 'success')
    }
  }

  // Variabel bantuan untuk UI
  const descriptionCount = `${description.length}/200`
  const isEditing = editingId !== null

  return (
    <Container className="py-4">
      <Row>
        {/* Kolom Form */}
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header as="h5">
              {isEditing ? 'Edit Produk' : 'Tambah Produk'}
            </Card.Header>
            <Card.Body>
              <Form noValidate onSubmit={handleSubmit}>
                {/* Input Nama Produk */}
                <Form.Group className="mb-3" controlId="categoryName">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Contoh: Sembako"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                    }}
                    isInvalid={!!errors.name}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
                    {/* Input Harga */}
              <Form.Group className="mb-3" controlId="categoryPrice">
                <Form.Label>Harga</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Contoh: 15000"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value)
                    if (errors.price) setErrors(prev => ({ ...prev, price: undefined }))
                  }}
                  isInvalid={!!errors.price}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.price}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Input Kategori */}
              <Form.Group className="mb-3" controlId="categorySelect">
                <Form.Label>Kategori</Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    if (errors.category) setErrors(prev => ({ ...prev, category: undefined }))
                  }}
                  isInvalid={!!errors.category}
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Pakaian">Pakaian</option>
                  <option value="Makanan">Makanan</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.category}
                </Form.Control.Feedback>
              </Form.Group>
                {/* Input Stok */}
              <Form.Group className="mb-3" controlId="categoryStock">
                <Form.Label>Stok Tersedia</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  min="0"
                  value={stock}
                  onChange={(e) => {
                    setStock(e.target.value)
                    if (errors.stock) setErrors(prev => ({ ...prev, stock: undefined }))
                  }}
                  isInvalid={!!errors.stock}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.stock}
                </Form.Control.Feedback>
                </Form.Group>
                  {/* Input Tanggal Rilis */}
        <Form.Group className="mb-3" controlId="categoryReleaseDate">
          <Form.Label>Tanggal Rilis</Form.Label>
          <Form.Control
            type="date"
            value={releaseDate}
            onChange={(e) => {
              setReleaseDate(e.target.value)
              if (errors.releaseDate) setErrors(prev => ({ ...prev, releaseDate: undefined }))
            }}
            isInvalid={!!errors.releaseDate}
          />
          <Form.Control.Feedback type="invalid">
            {errors.releaseDate}
          </Form.Control.Feedback>
        </Form.Group>
        {/* Input Produk Aktif */}
        <Form.Group className="mb-3" controlId="categoryIsActive">
          <Form.Check 
            type="switch"
            label="Produk Aktif (Tampilkan di Toko)"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </Form.Group>
                {/* Input Deskripsi */}
                <Form.Group className="mb-3" controlId="categoryDescription">
                  <Form.Label>Deskripsi (opsional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Tulis deskripsi Produk (maks. 200 karakter)"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      if (errors.description) setErrors(prev => ({ ...prev, description: undefined }))
                    }}
                    isInvalid={!!errors.description}
                    maxLength={200}
                  />
                  <div className="d-flex justify-content-between">
                    <Form.Text muted>Berikan deskripsi singkat Produk.</Form.Text>
                    <Form.Text muted>{descriptionCount}</Form.Text>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>
                {/* Tombol Aksi */}
                <div className="d-flex gap-2">
                  <Button type="submit" variant={isEditing ? 'primary' : 'success'}>
                    {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="secondary" onClick={resetForm}>
                      Batal
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      
        {/* Kolom Tabel */}
        <Col lg={7}>
          <Card>
            <Card.Header as="h5">Daftar Produk</Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 60 }} className="text-center">#</th>
                    <th>Nama</th>
                    <th>Harga</th>
                    <th>Kategori</th>
                    <th>Tanggal Rilis</th>
                    <th>Stok</th>
                    <th>Status</th>
                    <th>Deskripsi</th>
                    <th style={{ width: 180 }} className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-muted">
                        Belum ada data Produk.
                      </td>
                    </tr>
                  ) : (
                    products.map((product, idx) => (
                      <tr key={product.id}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{product.name}</td>
                        <td>{product.price}</td>
                        <td>{product.category}</td>
                        <td>{product.releaseDate}</td> 
                        <td>{product.stock}</td>
                        <td>{product.description}</td>
                        <td>{product.isActive ? 'Aktif' : 'Tidak Aktif'}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button size="sm" variant="warning" onClick={() => handleEdit(product)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Komponen Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Notifikasi</strong>
            <small>Baru saja</small>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  )
}