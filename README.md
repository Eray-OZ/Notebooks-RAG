# WebRag Projesi (Teknik Dokümantasyon)

Bu doküman, WebRag projesinin teknik mimarisini, veri akışını ve temel bileşenlerini detaylı bir şekilde açıklamaktadır.

## 1. Genel Bakış

WebRag, kullanıcıların doküman (PDF) yükleyerek bu dokümanların içeriği hakkında yapay zeka destekli sorular sormasını sağlayan bir RAG (Retrieval-Augmented Generation) uygulamasıdır. Sistem, bir Node.js/Express backend ve bir React frontend'den oluşan istemci-sunucu mimarisine sahiptir.

## 2. Temel Teknolojiler

- **Backend:**
  - **Framework:** Node.js, Express.js
  - **Veritabanları:**
    - **Metadata:** MongoDB (Mongoose ODM ile)
    - **Vektör Depolama:** LanceDB
  - **Kimlik Doğrulama:** JSON Web Tokens (JWT), bcrypt
  - **Yapay Zeka & Veri İşleme:** Hugging Face Inference API, `pdf-parse`
  - **Dosya Yükleme:** Multer

- **Frontend:**
  - **Kütüphane/Framework:** React, Vite
  - **UI:** Material-UI (MUI)
  - **Routing:** React Router DOM
  - **API İstemcisi:** Axios

---

## 3. Teknik Mimari

### Backend Mimarisi (`/server`)

Backend, modüler ve ölçeklenebilir bir yapıya sahip olacak şekilde tasarlanmıştır.

- **`config/`**: Veritabanı bağlantıları (`db.js`) ve merkezi konfigürasyon ayarlarını içerir.
- **`controllers/`**: Gelen isteklerin iş mantığını yönetir. Örneğin, `auth.controller.js` kullanıcı kayıt ve giriş işlemlerini, `notebook.controller.js` not defteri operasyonlarını yönetir.
- **`models/`**: MongoDB şemalarını tanımlar. `User.model.js`, `Notebook.model.js` ve `Document.model.js` gibi dosyalarla veri yapısını belirler.
- **`routes/`**: API endpoint'lerini tanımlar ve bunları ilgili controller metotlarına yönlendirir. Örneğin, `auth.routes.js` `/api/auth` altındaki yolları yönetir.
- **`middlewares/`**: İstek-cevap döngüsü arasında çalışan ara yazılımları içerir. `auth.middleware.js` JWT tabanlı kimlik doğrulama kontrolü yapar, `uploader.js` Multer ile dosya yükleme işlemlerini yönetir.
- **`services/`**: Dış servislerle (Hugging Face, LanceDB) olan etkileşimi soyutlar.
  - **`ai.service.js`**: Hugging Face API'sine istek atarak embedding oluşturma ve metin üretme (generation) işlemlerini gerçekleştirir.
  - **`vector.service.js`**: LanceDB ile etkileşime girerek vektör ekleme ve anlamsal arama (similarity search) yapar.
  - **`document.processor.js`**: Yüklenen PDF dosyalarını ayrıştırır (`pdf-parse`), metinleri parçalara ayırır ve vektörleştirme için hazırlar.

### Frontend Mimarisi (`/client`)

Frontend, bileşen tabanlı ve yönetimi kolay bir yapı sunar.

- **`pages/`**: Uygulamanın ana sayfalarını temsil eden bileşenleri içerir (`HomePage`, `LoginPage`, `DashboardPage` vb.). Her sayfa, belirli bir URL yoluna karşılık gelir.
- **`components/`**: Sayfalar arasında yeniden kullanılabilen daha küçük UI bileşenlerini barındırır (`Navbar`, `CreateNotebookModal` vb.).
- **`context/`**: Uygulama genelinde state yönetimi için React Context API'sini kullanır. `AuthContext.jsx`, kullanıcı kimlik bilgilerini ve oturum durumunu global olarak saklar.
- **`services/`**: Backend API'si ile olan iletişimi merkezileştirir. `api.js`, Axios'u yapılandırarak token yönetimi ve isteklerin gönderilmesinden sorumludur.
- **`hooks/`**: Tekrar eden mantığı soyutlamak için kullanılan özel React hook'larını içerir.
- **`App.jsx`**: `react-router-dom` kullanarak ana yönlendirme (routing) mantığını tanımlar ve `ProtectedRoute.jsx` gibi bileşenlerle belirli yolların sadece kimlik doğrulaması yapılmış kullanıcılar tarafından erişilebilir olmasını sağlar.

---

## 4. Veri Akışı: RAG Pipeline

Sistemin temelini oluşturan RAG süreci aşağıdaki adımlardan oluşur:

1.  **Doküman Yükleme:** Kullanıcı, frontend üzerinden bir PDF dosyası seçer ve yükler.
2.  **Metin Çıkarma ve İşleme (Backend):**
    - `uploader.js` middleware'i ile dosya sunucuya alınır.
    - `document.processor.js`, `pdf-parse` kullanarak PDF'in metin içeriğini çıkarır.
    - Metin, yönetilebilir küçük parçalara (chunks) bölünür.
3.  **Embedding Oluşturma:**
    - Her metin parçası, `ai.service.js` aracılığıyla Hugging Face'deki bir embedding modeline gönderilir.
    - Model, her parça için anlamsal içeriği temsil eden bir vektör (embedding) döner.
4.  **Vektör Depolama:**
    - Oluşturulan vektörler ve karşılık geldikleri orijinal metin parçaları, `vector.service.js` kullanılarak LanceDB veritabanına kaydedilir.
    - Dokümanın metadata'sı (adı, kullanıcı bilgisi vb.) ise MongoDB'ye yazılır.
5.  **Soru Sorma (Retrieval & Generation):**
    - Kullanıcı bir soru sorduğunda, bu soru `ai.service.js` aracılığıyla Hugging Face'in `intfloat/multilingual-e5-large` modeli kullanılarak bir vektöre dönüştürülür.
    - Bu soru vektörü, LanceDB'de anlamsal arama (similarity search) yapmak için kullanılır ve soruyla en alakalı metin parçaları (context) bulunur.
    - Alakalı metin parçaları ve kullanıcının orijinal sorusu, bir prompt şablonu içinde birleştirilerek Google'ın **Gemini 2.5 Flash** modeline (`ai.service.js` üzerinden) gönderilir.
    - Gemini modeli, sağlanan bağlama (context) dayanarak bir cevap üretir ve bu cevap kullanıcıya gösterilir.

---

## 5. API Endpoint'leri

Aşağıda, backend tarafından sunulan ana API endpoint'lerinden bazıları listelenmiştir:

| Metot  | Endpoint                             | Açıklama                                                     |
| :----- | :----------------------------------- | :----------------------------------------------------------- |
| **Authentication** |                                      |                                                              |
| POST   | `/api/auth/register`                 | Yeni bir kullanıcı kaydı oluşturur.                          |
| POST   | `/api/auth/login`                    | Kullanıcı girişi yapar ve JWT döner.                         |
| **Notebooks**      |                                      |                                                              |
| GET    | `/api/notebooks/public`              | Herkese açık not defterlerini listeler.                      |
| GET    | `/api/notebooks/mynotebooks`         | (Auth Gerekli) Oturum açmış kullanıcıya ait not defterlerini listeler. |
| GET    | `/api/notebooks/:notebookId`         | (Auth Gerekli) Belirli bir not defterinin detaylarını getirir. |
| POST   | `/api/notebooks`                     | (Auth Gerekli) Yeni bir not defteri oluşturur.               |
| POST   | `/api/notebooks/:notebookId/messages`| (Auth Gerekli) Bir not defterine sohbet mesajı gönderir.     |
| PATCH  | `/api/notebooks/:notebookId/like`    | (Auth Gerekli) Bir not defterini beğenir/beğenmekten vazgeçer. |
| PATCH  | `/api/notebooks/:notebookId`         | (Auth Gerekli) Bir not defterini günceller.                  |
| **Documents**      |                                      |                                                              |
| GET    | `/api/documents`                     | (Auth Gerekli) Kullanıcıya ait tüm dokümanları listeler.     |
| POST   | `/api/documents`                     | (Auth Gerekli) Yeni bir doküman yükler ve işler.             |
| POST   | `/api/notebooks/:notebookId/documents` | (Auth Gerekli) Belirli bir not defterine doküman yükler.     |

---

## 6. Kurulum ve Çalıştırma

Projenin kurulumu ve çalıştırılması için önceki `README.md` dosyasındaki adımları takip edebilirsiniz. Bu adımlar, backend ve frontend ortamlarının nasıl hazırlanacağını ve sunucuların nasıl başlatılacağını açıklamaktadır.