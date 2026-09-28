/**
 * Imágenes de diapositivas congeladas, en IndexedDB (localStorage no da abasto para imágenes
 * de 16:9 en buena resolución). Todo con try/catch: en modo privado puede no estar disponible,
 * y entonces congelar simplemente no guarda la imagen.
 */

const BASE = "cia-presentaciones";
const ALMACEN = "imagenes";

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolver, rechazar) => {
    const pedido = indexedDB.open(BASE, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(ALMACEN);
    pedido.onsuccess = () => resolver(pedido.result);
    pedido.onerror = () => rechazar(pedido.error);
  });
}

async function operar<T>(modo: IDBTransactionMode, fn: (a: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await abrir();
  return new Promise((resolver, rechazar) => {
    const tx = db.transaction(ALMACEN, modo);
    const pedido = fn(tx.objectStore(ALMACEN));
    pedido.onsuccess = () => resolver(pedido.result);
    pedido.onerror = () => rechazar(pedido.error);
    tx.oncomplete = () => db.close();
  });
}

export async function guardarImagen(id: string, dataUrl: string) {
  try {
    await operar("readwrite", (a) => a.put(dataUrl, id));
  } catch (e) {
    console.warn("[presentaciones] no se pudo guardar la imagen", e);
  }
}

export async function leerImagen(id: string): Promise<string | null> {
  try {
    return ((await operar("readonly", (a) => a.get(id))) as string | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function borrarImagen(id: string) {
  try {
    await operar("readwrite", (a) => a.delete(id));
  } catch {}
}
