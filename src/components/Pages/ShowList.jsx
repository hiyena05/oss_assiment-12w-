import React, { useEffect, useState } from "react";
const API_BASE = "https://6915405984e8bd126af939d3.mockapi.io";
const ENDPOINT = `${API_BASE}/Book`;

function ShowList() {
  // 책 목록
  const [books, setBooks] = useState([]);
  // 검색 키워드
  const [keyword, setKeyword] = useState("");
  // create / edit 모드
  const [mode, setMode] = useState("create"); // "create" or "edit"
  // 현재 수정/추가 대상 데이터
  const [current, setCurrent] = useState({
    id: "",
    title: "",
    author: "",
    year: "",
    status: "available",
    rating: "",
  });
  // 모달 표시 여부
  const [showModal, setShowModal] = useState(false);
  // 로딩 / 에러 상태
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function api(method, url, data) {
    const opt = { method, headers: {} };
    if (data) {
      opt.headers["content-type"] = "application/json; charset=UTF-8";
      opt.body = JSON.stringify(data);
    }
    const res = await fetch(url, opt);
    if (!res.ok) {
      throw new Error(res.statusText || "API error");
    }
    return res.json();
  }

  // 목록 불러오기
  async function loadList() {
    try {
      setLoading(true);
      setErrorMsg("");
      const rows = await api("GET", ENDPOINT);
      setBooks(rows);
    } catch (err) {
      setErrorMsg("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // 최초 로딩 시 목록 한 번 가져오기
  useEffect(() => {
    loadList();
  }, []);

  // 검색 버튼 핸들러 (4-2의 “도서명/저자 검색...” 컨셉 유지)
  async function handleSearch() {
    if (!keyword.trim()) {
      // 키워드 없으면 전체 목록 다시 로딩
      loadList();
      return;
    }
    try {
      setLoading(true);
      setErrorMsg("");
      const all = await api("GET", ENDPOINT);
      const lower = keyword.toLowerCase();
      const filtered = all.filter(
        (x) =>
          (x.title && x.title.toLowerCase().includes(lower)) ||
          (x.author && x.author.toLowerCase().includes(lower))
      );
      setBooks(filtered);
    } catch (err) {
      setErrorMsg("검색 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // 검색 초기화
  function handleReset() {
    setKeyword("");
    loadList();
  }

  // 모달 열기 - 새 데이터 추가
  function openCreate() {
    setMode("create");
    setCurrent({
      id: "",
      title: "",
      author: "",
      year: "",
      status: "available",
      rating: "",
    });
    setShowModal(true);
  }

  // 모달 열기 - 기존 데이터 수정
  function openEdit(book) {
    setMode("edit");
    setCurrent({
      id: book.id,
      title: book.title ?? "",
      author: book.author ?? "",
      year: book.year ?? "",
      status: book.status ?? "available",
      rating: book.rating ?? "",
    });
    setShowModal(true);
  }

  // 삭제
  async function handleDelete(id) {
    // 4-2 원본 confirm 메시지와 동일
    if (!window.confirm("정말 삭제할까요?")) return;
    try {
      setLoading(true);
      setErrorMsg("");
      await api("DELETE", `${ENDPOINT}/${id}`);
      await loadList();
    } catch (err) {
      setErrorMsg("삭제 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // 모달 저장 버튼 (추가/수정 공통)
  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedTitle = current.title.trim();
    const trimmedAuthor = current.author.trim();
    const yearValue = current.year.toString().trim();
    const ratingValue = current.rating.toString().trim();

    if (!trimmedTitle || !trimmedAuthor || !yearValue) {

      alert("Title, Author, Year는 필수입니다.");
      return;
    }

    const data = {
      title: trimmedTitle,
      author: trimmedAuthor,
      year: Number(yearValue),
      status: current.status,
      rating: ratingValue === "" ? null : Number(ratingValue),
    };

    try {
      setLoading(true);
      setErrorMsg("");
      if (mode === "create") {
        await api("POST", ENDPOINT, data);
      } else {
        await api("PUT", `${ENDPOINT}/${current.id}`, data);
      }
      setShowModal(false);
      await loadList();
    } catch (err) {
      setErrorMsg("저장 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      {/* 상단 헤더 - 4-2와 동일한 텍스트 사용 */}
      <header className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h3 mb-0">도서 관리</h1>
        <div className="text-muted small">
          {/* 원본: API: <code id="apiLabel"></code> */}
          API: <code>{ENDPOINT}</code>
        </div>
      </header>

      {/* 에러 메시지 */}
      {errorMsg && (
        <div className="alert alert-danger py-2" role="alert">
          {errorMsg}
        </div>
      )}

      {/* Toolbar - 버튼/플레이스홀더*/}
      <div className="d-flex gap-2 mb-3">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadList}
          disabled={loading}
        >
          데이터 목록보기
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreate}
          disabled={loading}
        >
          도서 추가
        </button>
        <div className="ms-auto input-group" style={{ maxWidth: "360px" }}>
          <input
            className="form-control"
            placeholder="도서명/저자 검색..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleSearch}
            disabled={loading}
          >
            검색
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleReset}
            disabled={loading}
          >
            초기화
          </button>
        </div>
      </div>

      {/* Grid*/}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: "60px" }}>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th style={{ width: "100px" }}>Year</th>
              <th style={{ width: "140px" }}>Status</th>
              <th style={{ width: "90px" }}>Rating</th>
              <th style={{ width: "180px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  데이터가 없습니다. MockAPI에 데이터를 추가해 주세요.
                </td>
              </tr>
            ) : (
              books.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.year}</td>
                  <td>
                    <span
                      className={
                        "badge badge-status " +
                        (b.status === "available"
                          ? "text-bg-success"
                          : "text-bg-secondary")
                      }
                    >
                      {b.status}
                    </span>
                  </td>
                  <td>{b.rating ?? ""}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => openEdit(b)}
                      disabled={loading}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(b.id)}
                      disabled={loading}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 모달 (Create/Update 공용)*/}
      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <form
                className="modal-content needs-validation"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="modal-header">
                  <h5 className="modal-title">
                    {mode === "create" ? "도서 추가" : "도서 수정"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="닫기"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* hidden id */}
                  <input type="hidden" value={current.id} />

                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={current.title}
                      onChange={(e) =>
                        setCurrent({ ...current, title: e.target.value })
                      }
                    />
                    <div className="invalid-feedback">Title은 필수다.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Author</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={current.author}
                      onChange={(e) =>
                        setCurrent({ ...current, author: e.target.value })
                      }
                    />
                    <div className="invalid-feedback">Author는 필수다.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Year</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      required
                      value={current.year}
                      onChange={(e) =>
                        setCurrent({ ...current, year: e.target.value })
                      }
                    />
                    <div className="invalid-feedback">
                      Year는 숫자로 입력해야 한다.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={current.status}
                      onChange={(e) =>
                        setCurrent({ ...current, status: e.target.value })
                      }
                    >
                      <option value="available">available</option>
                      <option value="checked_out">checked_out</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="5"
                      step="0.1"
                      value={current.rating}
                      onChange={(e) =>
                        setCurrent({ ...current, rating: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    저장
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* 모달 배경 */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}

export default ShowList;
