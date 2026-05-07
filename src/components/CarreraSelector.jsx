import { CARRERAS } from '../data/carreras'

export default function CarreraSelector({ value, onChange, style }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="input-field"
      style={style}
    >
      <option value="">Sin especificar (opcional)</option>
      {CARRERAS.map(f => (
        <optgroup key={f.facultad} label={f.facultad}>
          {f.programas.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
