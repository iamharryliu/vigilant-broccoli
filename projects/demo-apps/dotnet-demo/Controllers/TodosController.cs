using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.Json;
using System.Text;
using System.Threading.Tasks;

namespace TodosApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TodosController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        private const string BaseUrl = "https://jsonplaceholder.typicode.com/todos";

        public TodosController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // GET: api/todo
        [HttpGet]
        public async Task<IActionResult> GetTodos()
        {
            var response = await _httpClient.GetAsync(BaseUrl);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return Ok(JsonSerializer.Deserialize<object>(content));
        }

        // POST: api/todo
        [HttpPost]
        public async Task<IActionResult> CreateTodo([FromBody] object newTodo)
        {
            var jsonContent = new StringContent(JsonSerializer.Serialize(newTodo), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(BaseUrl, jsonContent);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return Ok(JsonSerializer.Deserialize<object>(content));
        }

        // PUT: api/todo/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTodo(int id, [FromBody] object updatedTodo)
        {
            var jsonContent = new StringContent(JsonSerializer.Serialize(updatedTodo), Encoding.UTF8, "application/json");
            var response = await _httpClient.PutAsync($"{BaseUrl}/{id}", jsonContent);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return Ok(JsonSerializer.Deserialize<object>(content));
        }

        // DELETE: api/todo/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            var response = await _httpClient.DeleteAsync($"{BaseUrl}/{id}");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return Ok(JsonSerializer.Deserialize<object>(content));
        }
    }
}
