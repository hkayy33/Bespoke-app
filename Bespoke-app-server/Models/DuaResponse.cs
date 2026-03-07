namespace BespokeDuaApi.Models
{
    public class DuaResponse
    {
        public DuaItem[] Duas { get; set; }
    }

    public class DuaItem
    {
        public string Dua { get; set; }
        public string Name { get; set; }
        public string Explanation { get; set; }
    }
}