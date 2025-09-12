# PayPal Configuration TODO

Pasos para configurar PayPal en producción y completar la integración de pagos.

## 1. Configurar Cuenta PayPal Developer

### 1.1 Crear Aplicación PayPal
- [ ] Ir a https://developer.paypal.com/
- [ ] Iniciar sesión con cuenta PayPal Business
- [ ] Crear nueva aplicación en "My Apps & Credentials"
- [ ] Seleccionar "Default Application" o crear nueva
- [ ] Configurar para **PRODUCTION** (no sandbox)

### 1.2 Obtener Credenciales de Producción
- [ ] Copiar **Client ID** de producción
- [ ] Copiar **Client Secret** de producción
- [ ] Guardar credenciales de forma segura

## 2. Variables de Entorno

### 2.1 Actualizar `.env.local` (Producción)
```env
# PayPal Configuration - PRODUCTION
PAYPAL_CLIENT_ID=tu_client_id_de_produccion_aqui
PAYPAL_CLIENT_SECRET=tu_client_secret_de_produccion_aqui
PAYPAL_ENVIRONMENT=production

# Webhooks
PAYPAL_WEBHOOK_ID=tu_webhook_id_aqui

# URLs de la aplicación
NEXT_PUBLIC_BASE_URL=https://www.miguelsoro.com
NEXT_PUBLIC_PAYPAL_CLIENT_ID=tu_client_id_de_produccion_aqui
```

### 2.2 Verificar `.env.example`
- [x] Ya incluye las variables PayPal necesarias
- [x] Documentadas para futuros desarrolladores

## 3. Configurar Webhooks PayPal

### 3.1 Crear Webhook en PayPal Dashboard
- [ ] Ir a Developer Dashboard > Webhooks
- [ ] Crear nuevo webhook
- [ ] URL: `https://www.miguelsoro.com/api/paypal/webhook`
- [ ] Seleccionar eventos:
  - [ ] `PAYMENT.CAPTURE.COMPLETED`
  - [ ] `PAYMENT.CAPTURE.DENIED`
  - [ ] `PAYMENT.CAPTURE.REFUNDED`
  - [ ] `CHECKOUT.ORDER.APPROVED`

### 3.2 Configurar Webhook ID
- [ ] Copiar Webhook ID generado
- [ ] Añadir a variables de entorno: `PAYPAL_WEBHOOK_ID`

## 4. Configurar Email SMTP (para confirmaciones)

### 4.1 Variables de Email
```env
# Email Configuration (ejemplo con Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password_aqui
SMTP_FROM_NAME=Miguel Soro Art
SMTP_FROM_EMAIL=noreply@miguelsoro.com
```

### 4.2 Configurar Gmail App Password (si usas Gmail)
- [ ] Activar 2FA en Gmail
- [ ] Generar App Password específica
- [ ] Usar App Password en `SMTP_PASS`

## 5. Configuración de Envíos

### 5.1 Configurar Tarifas de Envío
- [ ] Acceder a `/admin/settings/tienda`
- [ ] Configurar:
  - [ ] Tarifa estándar de envío (ej: €30)
  - [ ] Umbral envío gratuito (ej: €50)
  - [ ] Activar sistema de envíos

### 5.2 Verificar Cálculos
- [ ] Probar con pedido < umbral gratuito
- [ ] Probar con pedido > umbral gratuito
- [ ] Verificar IVA (21% España)

## 6. Testing en Sandbox (Desarrollo)

### 6.1 Variables Sandbox (para desarrollo local)
```env
# PayPal Configuration - SANDBOX (desarrollo)
PAYPAL_CLIENT_ID=sandbox_client_id_aqui
PAYPAL_CLIENT_SECRET=sandbox_client_secret_aqui  
PAYPAL_ENVIRONMENT=sandbox
```

### 6.2 Cuentas de Prueba Sandbox
- [ ] Crear cuenta comprador en sandbox
- [ ] Crear cuenta vendedor en sandbox
- [ ] Probar flujo completo de pago

## 7. Verificar Funcionalidad Complete

### 7.1 Flujo de Compra
- [ ] Añadir producto al carrito
- [ ] Ir a checkout
- [ ] Completar formulario cliente
- [ ] Pagar con PayPal
- [ ] Verificar página confirmación
- [ ] Recibir email confirmación

### 7.2 Panel de Administración
- [ ] Verificar orden en `/admin/orders`
- [ ] Comprobar estado de pago
- [ ] Ver detalles completos pedido

### 7.3 Base de Datos
- [ ] Verificar orden en tabla `Order`
- [ ] Verificar items en tabla `OrderItem`
- [ ] Comprobar PayPal Order ID almacenado

## 8. Configuración Avanzada

### 8.1 Personalizar Experiencia PayPal
En `/lib/paypal.ts` puedes personalizar:
- [ ] Colores del botón PayPal
- [ ] Mensajes de la marca
- [ ] Configuración regional

### 8.2 Webhooks Adicionales (Opcional)
- [ ] `PAYMENT.CAPTURE.PENDING` - Para pagos pendientes
- [ ] `PAYMENT.CAPTURE.DECLINED` - Para pagos rechazados
- [ ] `BILLING.SUBSCRIPTION.*` - Si añades suscripciones

## 9. Seguridad y Compliance

### 9.1 Variables Secretas
- [ ] **NUNCA** commitear credenciales reales
- [ ] Usar variables de entorno en producción
- [ ] Rotar credenciales periódicamente

### 9.2 HTTPS Obligatorio
- [ ] PayPal requiere HTTPS en producción
- [ ] Verificar certificados SSL válidos
- [ ] Todos los webhooks deben usar HTTPS

### 9.3 Validación de Webhooks
- [x] Código ya implementa verificación de firma
- [x] Protege contra webhooks falsos
- [ ] Monitorear logs de webhooks

## 10. Monitoreo y Logs

### 10.1 Logs de PayPal
- [ ] Monitorear `/api/paypal/create-order`
- [ ] Monitorear `/api/paypal/capture-order`
- [ ] Revisar logs de webhook regularmente

### 10.2 Dashboard PayPal
- [ ] Revisar transacciones diariamente
- [ ] Configurar alertas de pago
- [ ] Monitorear disputas/chargebacks

## 11. Deployment Checklist

### 11.1 Variables de Producción
- [ ] `PAYPAL_CLIENT_ID` configurado
- [ ] `PAYPAL_CLIENT_SECRET` configurado
- [ ] `PAYPAL_ENVIRONMENT=production`
- [ ] `PAYPAL_WEBHOOK_ID` configurado
- [ ] Variables SMTP configuradas

### 11.2 URLs de Producción  
- [ ] `NEXT_PUBLIC_BASE_URL=https://www.miguelsoro.com`
- [ ] Webhooks apuntando a dominio real
- [ ] Certificados SSL activos

### 11.3 Testing Final
- [ ] Transacción real con céntimos (€0.01)
- [ ] Verificar email llegó correctamente
- [ ] Confirmar webhook funcionó
- [ ] Orden aparece en admin panel

## 12. Documentación Adicional

### Enlaces Útiles
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Webhook Events](https://developer.paypal.com/docs/api-basics/notifications/webhooks/event-names/)
- [PayPal JavaScript SDK](https://developer.paypal.com/sdk/js/reference/)

### Soporte
- PayPal Developer Community
- PayPal Merchant Technical Support
- Documentación integración en `/lib/paypal.ts`

---

**⚠️ IMPORTANTE**: Siempre probar primero en Sandbox antes de activar en producción.

**✅ CHECKLIST MÍNIMO PARA PRODUCCIÓN**:
- [ ] Credenciales PayPal producción configuradas
- [ ] HTTPS activo en dominio
- [ ] Webhook funcionando  
- [ ] Email SMTP configurado
- [ ] Una transacción de prueba exitosa